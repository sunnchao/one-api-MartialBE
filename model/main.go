package model

import (
	"fmt"
	"net/url"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func SetupDB() {
	err := InitDB()
	if err != nil {
		logger.FatalLog("failed to initialize database: " + err.Error())
	}
	ChannelGroup.Load()
	GlobalUserGroupRatio.Load()
	config.RootUserEmail = GetRootUserEmail()
	NewModelOwnedBys()

	if viper.GetBool("batch_update_enabled") {
		config.BatchUpdateEnabled = true
		config.BatchUpdateInterval = utils.GetOrDefault("batch_update_interval", 5)
		logger.SysLog("batch update enabled with interval " + strconv.Itoa(config.BatchUpdateInterval) + "s")
		InitBatchUpdater()
	}
}

func createRootAccountIfNeed() error {
	var user User
	//if user.Status != common.UserStatusEnabled {
	if err := DB.First(&user).Error; err != nil {
		logger.SysLog("no user exists, create a root user for you: username is root, password is 123456")
		hashedPassword, err := common.Password2Hash("123456")
		if err != nil {
			return err
		}
		rootUser := User{
			Username:    "root",
			Password:    hashedPassword,
			Role:        config.RoleRootUser,
			Status:      config.UserStatusEnabled,
			DisplayName: "Root User",
			AccessToken: utils.GetUUID(),
			Quota:       100000000,
		}
		DB.Create(&rootUser)
	}
	return nil
}

func chooseDB() (*gorm.DB, error) {
	if viper.IsSet("sql_dsn") {
		dsn := viper.GetString("sql_dsn")
		localTimezone := utils.GetLocalTimezone()
		if strings.HasPrefix(dsn, "postgres://") {
			// Use PostgreSQL
			logger.SysLog("using PostgreSQL as database")
			common.UsingPostgreSQL = true
			dsn = dsnAddArg(dsn, "timezone", localTimezone)

			return gorm.Open(postgres.New(postgres.Config{
				DSN:                  dsn,
				PreferSimpleProtocol: true, // disables implicit prepared statement usage
			}), &gorm.Config{
				PrepareStmt: true, // precompile SQL
			})

		}
		// Use MySQL
		logger.SysLog("using MySQL as database")
		// mysql 时区设置
		dsn = dsnAddArg(dsn, "loc", localTimezone)
		// dsn = dsnAddArg(dsn, "parseTime", "true")
		return gorm.Open(mysql.Open(dsn), &gorm.Config{
			PrepareStmt: true, // precompile SQL
		})
	}
	// Use SQLite
	logger.SysLog("SQL_DSN not set, using SQLite as database")
	common.UsingSQLite = true
	config := fmt.Sprintf("?_busy_timeout=%d", utils.GetOrDefault("sqlite_busy_timeout", 3000))
	return gorm.Open(sqlite.Open(viper.GetString("sqlite_path")+config), &gorm.Config{
		PrepareStmt: true, // precompile SQL
	})
}

func InitDB() (err error) {
	db, err := chooseDB()
	if err != nil {
		logger.FatalLog(err)
		return err
	}

	if config.Debug {
		db = db.Debug()
	}
	DB = db

	// 优化数据库连接配置
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	// 根据实际负载调整连接池参数
	sqlDB.SetMaxIdleConns(utils.GetOrDefault("SQL_MAX_IDLE_CONNS", 100))
	sqlDB.SetMaxOpenConns(utils.GetOrDefault("SQL_MAX_OPEN_CONNS", 1000))
	sqlDB.SetConnMaxLifetime(time.Minute * time.Duration(utils.GetOrDefault("SQL_MAX_LIFETIME", 30)))
	sqlDB.SetConnMaxIdleTime(time.Minute * 10)

	if !config.IsMasterNode {
		return nil
	}

	logger.SysLog("database migration started")
	migrationBefore(DB)

	// 禁用外键检查，提高迁移速度
	disableFK := "SET FOREIGN_KEY_CHECKS=0;"
	enableFK := "SET FOREIGN_KEY_CHECKS=1;"

	if common.UsingPostgreSQL {
		disableFK = "SET CONSTRAINTS ALL DEFERRED;"
		enableFK = "SET CONSTRAINTS ALL IMMEDIATE;"
	} else if common.UsingSQLite {
		disableFK = "PRAGMA foreign_keys=OFF;"
		enableFK = "PRAGMA foreign_keys=ON;"
	}

	DB.Exec(disableFK)
	defer DB.Exec(enableFK)

	// 按照依赖关系顺序进行迁移
	// 1. 首先迁移基础表
	baseModels := []interface{}{
		&User{},
		&Channel{},
		&Token{},
		&Option{},
		&UserGroup{},
	}

	for _, model := range baseModels {
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate base model: %v", err)
		}
	}

	// 2. 迁移依赖基础表的表
	dependentModels := []interface{}{
		&Log{},
		&Price{},
		&Redemption{},
		&TelegramMenu{},
		&Midjourney{},
		&ModelOwnedBy{},
		&ChannelKey{},
		&ModelInfo{},
		&WebAuthnCredential{},
	}

	errChan := make(chan error, len(dependentModels))

	for _, model := range dependentModels {
		go func(m interface{}) {
			errChan <- db.AutoMigrate(m)
		}(model)
	}

	// 等待所有依赖表迁移完成
	for i := 0; i < len(dependentModels); i++ {
		if err := <-errChan; err != nil {
			return fmt.Errorf("failed to migrate dependent model: %v", err)
		}
	}

	// 3. 最后迁移业务表
	businessModels := []interface{}{
		&Order{},
		&Payment{},
		&ClaudeCodeSubscription{},
		&ClaudeCodePlan{},
		&ClaudeCodeUsageLog{},
		&ClaudeCodeAPIKey{},
		&Task{},
		&Statistics{},
		&UserOperation{},
		&UserNotification{},
		&CouponTemplate{},
		&UserCoupon{},
		&CheckinReward{},
		&UserCheckinRecord{},
	}

	for _, model := range businessModels {
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate business model: %v", err)
		}
	}

	if config.UserInvoiceMonth {
		err = db.AutoMigrate(&StatisticsMonthGeneratedHistory{})
		if err != nil {
			return err
		}

		err = db.AutoMigrate(&StatisticsMonth{})
		if err != nil {
			return err
		}
	}

	err = migrationAfter(DB)
	if err != nil {
		return err
	}
	logger.SysLog("database migration completed")

	// 初始化优惠券系统
	if err := InitCouponSystem(); err != nil {
		logger.SysError("初始化优惠券系统失败: " + err.Error())
	}

	// 创建root账号
	return createRootAccountIfNeed()
}

// func MigrateDB(db *gorm.DB) error {
// 	if DB.Migrator().HasConstraint(&Price{}, "model") {
// 		fmt.Println("----Price model has constraint----")
// 		// 如果是主键，移除主键约束
// 		err := db.Migrator().DropConstraint(&Price{}, "model")
// 		if err != nil {
// 			return err
// 		}
// 		// 修改字段长度
// 		err = db.Migrator().AlterColumn(&Price{}, "model")
// 		if err != nil {
// 			return err
// 		}
// 	}

// 	return nil
// }

func CloseDB() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	err = sqlDB.Close()
	return err
}

func dsnAddArg(dsn string, arg string, value string) string {
	// 如果是MySQL 需要转义
	if !common.UsingPostgreSQL {
		value = url.QueryEscape(value)
	}

	if !strings.Contains(dsn, arg+"=") {
		if strings.Contains(dsn, "?") {
			dsn += "&" + arg + "=" + value
		} else {
			dsn += "?" + arg + "=" + value
		}
	}
	return dsn
}
