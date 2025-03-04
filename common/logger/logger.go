package logger

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"one-api/common/utils"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

const (
	loggerINFO  = "INFO"
	loggerWarn  = "WARN"
	loggerError = "ERR"
)
const (
	RequestIdKey = "X-Oneapi-Request-Id"
  RequestIPKey = "X-Oneapi-Request-IP"
)

var Logger *zap.Logger

var defaultLogDir = "./logs"

func SetupLogger() {
	logDir := getLogDir()
	if logDir == "" {
		return
	}

	writeSyncer := getLogWriter(logDir)

	encoder := getEncoder()

	core := zapcore.NewCore(
		encoder,
		writeSyncer,
		zap.NewAtomicLevelAt(getLogLevel()),
	)
	Logger = zap.New(core, zap.AddCaller())
}

func getEncoder() zapcore.Encoder {
	encodeConfig := zap.NewProductionEncoderConfig()

	encodeConfig.EncodeTime = zapcore.TimeEncoderOfLayout("2006/01/02 - 15:04:05")
	encodeConfig.TimeKey = "time"
	encodeConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	encodeConfig.EncodeCaller = zapcore.ShortCallerEncoder

	encodeConfig.EncodeDuration = zapcore.StringDurationEncoder

	return zapcore.NewConsoleEncoder(encodeConfig)
}

func getLogWriter(logDir string) zapcore.WriteSyncer {
	filename := utils.GetOrDefault("logs.filename", "one-hub")
	maxsize := utils.GetOrDefault("logs.max_size", 100)
	maxAge := utils.GetOrDefault("logs.max_age", 7)
	maxBackup := utils.GetOrDefault("logs.max_backup", 10)
	compress := utils.GetOrDefault("logs.compress", false)

	// 创建带时间戳的写入器
	return newHourlyRotateWriter(logDir, filename, maxsize, maxAge, maxBackup, compress)
}

// 新增hourlyRotateWriter结构体
type hourlyRotateWriter struct {
	mu          sync.Mutex
	currentHour int
	logDir      string
	baseName    string
	writer      *lumberjack.Logger
	maxSize     int
	maxAge      int
	maxBackup   int
	compress    bool
}

func newHourlyRotateWriter(logDir, baseName string, maxSize, maxAge, maxBackup int, compress bool) *hourlyRotateWriter {
	w := &hourlyRotateWriter{
		logDir:    logDir,
		baseName:  baseName,
		maxSize:   maxSize,
		maxAge:    maxAge,
		maxBackup: maxBackup,
		compress:  compress,
	}
	w.writer = w.createWriter()
	return w
}

func (w *hourlyRotateWriter) createWriter() *lumberjack.Logger {
	now := time.Now()
	w.currentHour = now.Hour()
	timestamp := now.Format("2006010215") // 格式化为年月日小时
	
	return &lumberjack.Logger{
		Filename:   filepath.Join(w.logDir, fmt.Sprintf("%s-%s.log", w.baseName, timestamp)),
		MaxSize:    w.maxSize,
		MaxAge:     w.maxAge,
		MaxBackups: w.maxBackup,
		Compress:   w.compress,
	}
}

func (w *hourlyRotateWriter) Write(p []byte) (n int, err error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	// 每小时检查一次是否需要轮转
	if time.Now().Hour() != w.currentHour {
		w.writer.Close()
		w.writer = w.createWriter()
	}
	
	return w.writer.Write(p)
}

func (w *hourlyRotateWriter) Sync() error {
	return nil
}

func getLogLevel() zapcore.Level {
	logLevel := viper.GetString("log_level")
	switch logLevel {
	case "debug":
		return zap.DebugLevel
	case "info":
		return zap.InfoLevel
	case "warn":
		return zap.WarnLevel
	case "error":
		return zap.ErrorLevel
	case "panic":
		return zap.PanicLevel
	case "fatal":
		return zap.FatalLevel
	default:
		return zap.InfoLevel
	}

}

func getLogDir() string {
	logDir := viper.GetString("log_dir")
	if logDir == "" {
		logDir = defaultLogDir
	}

	var err error
	logDir, err = filepath.Abs(logDir)
	if err != nil {
		log.Fatal(err)
		return ""
	}

	if !utils.IsFileExist(logDir) {
		err = os.Mkdir(logDir, 0777)
		if err != nil {
			log.Fatal(err)
			return ""
		}
	}

	return logDir
}

func SysLog(s string) {
	entry := zapcore.Entry{
		Level:   zapcore.InfoLevel,
		Time:    time.Now(),
		Message: "[SYS] | " + s,
	}

	// 使用 Logger 的核心来直接写入日志，绕过等级检查
	if ce := Logger.Core().With([]zapcore.Field{}); ce != nil {
		ce.Write(entry, nil)
	}
}

func SysError(s string) {
	Logger.Error("[SYS] | " + s)
}

func LogInfo(ctx context.Context, msg string) {
	logHelper(ctx, loggerINFO, msg)
}

func LogWarn(ctx context.Context, msg string) {
	logHelper(ctx, loggerWarn, msg)
}

func LogError(ctx context.Context, msg string) {
	logHelper(ctx, loggerError, msg)
}

func logHelper(ctx context.Context, level string, msg string) {

	id, ok := ctx.Value(RequestIdKey).(string)
	if !ok {
		id = "unknown"
	}

	logMsg := fmt.Sprintf("%s | %s \n", id, msg)

	switch level {
	case loggerINFO:
		Logger.Info(logMsg)
	case loggerWarn:
		Logger.Warn(logMsg)
	case loggerError:
		Logger.Error(logMsg)
	default:
		Logger.Info(logMsg)
	}

}

func FatalLog(v ...any) {

	Logger.Fatal(fmt.Sprintf("[FATAL] %v | %v \n", time.Now().Format("2006/01/02 - 15:04:05"), v))
	// t := time.Now()
	// _, _ = fmt.Fprintf(gin.DefaultErrorWriter, "[FATAL] %v | %v \n", t.Format("2006/01/02 - 15:04:05"), v)
	os.Exit(1)
}
