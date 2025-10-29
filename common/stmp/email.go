package stmp

import (
	"context"
	"errors"
	"fmt"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/utils"
	"strconv"
	"strings"

	"github.com/wneessen/go-mail"
)

var SendResetError = &mail.SendError{
	Reason: mail.ErrSMTPReset,
}

type StmpConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

func NewStmp(host string, port int, username string, password string, from string) *StmpConfig {
	if from == "" {
		from = username
	}

	return &StmpConfig{
		Host:     host,
		Port:     port,
		Username: username,
		Password: password,
		From:     from,
	}
}

func (s *StmpConfig) Send(to, subject, body string) error {
	message := mail.NewMsg()
	message.From(s.From)
	message.To(to)
	message.Subject(subject)
	message.SetGenHeader("References", s.getReferences())
	message.SetBodyString(mail.TypeTextHTML, body)
	message.SetUserAgent(fmt.Sprintf("Chirou API %s // https://github.com/MartialBE/one-hub", config.Version))

	client, err := mail.NewClient(
		s.Host,
		mail.WithPort(s.Port),
		mail.WithUsername(s.Username),
		mail.WithPassword(s.Password),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
	)

	if err != nil {
		return err
	}

	switch s.Port {
	case 465:
		client.SetSSL(true)
	case 587:
		client.SetTLSPolicy(mail.TLSMandatory)
		client.SetSMTPAuth(mail.SMTPAuthLogin)
	}

	if err := DialAndSend(client, message); err != nil {
		return err
	}

	return nil
}

func (s *StmpConfig) getReferences() string {
	froms := strings.Split(s.From, "@")
	return fmt.Sprintf("<%s.%s@%s>", froms[0], utils.GetUUID(), froms[1])
}

func (s *StmpConfig) Render(to, subject, content string) error {
	body := getDefaultTemplate(content)

	return s.Send(to, subject, body)
}

func GetSystemStmp() (*StmpConfig, error) {
	if config.SMTPServer == "" || config.SMTPPort == 0 || config.SMTPAccount == "" || config.SMTPToken == "" {
		return nil, fmt.Errorf("SMTP 信息未配置")
	}

	return NewStmp(config.SMTPServer, config.SMTPPort, config.SMTPAccount, config.SMTPToken, config.SMTPFrom), nil
}

func SendPasswordResetEmail(userName, email, link string) error {
	stmp, err := GetSystemStmp()

	if err != nil {
		return err
	}

	contentTemp := `<p style="font-size: 30px">Hi <strong>%s,</strong></p>
	<p>
		您正在进行密码重置。点击下方按钮以重置密码。
	</p>

	<p style="text-align: center; font-size: 13px;">
		<a target="__blank" href="%s" class="button" style="color: #ffffff;">重置密码</a>
	</p>

	<p style="color: #858585; padding-top: 15px;">
		如果链接无法点击，请尝试点击下面的链接或将其复制到浏览器中打开<br> %s
	</p>
	<p style="color: #858585;">重置链接 %d 分钟内有效，如果不是本人操作，请忽略。</p>`

	subject := fmt.Sprintf("%s密码重置", config.SystemName)
	content := fmt.Sprintf(contentTemp, userName, link, link, common.VerificationValidMinutes)

	return stmp.Render(email, subject, content)
}

func SendVerificationCodeEmail(email, code string) error {
	stmp, err := GetSystemStmp()

	if err != nil {
		return err
	}

	systemName := config.SystemName
	if systemName == "" {
		systemName = "Chirou API"
	}

	contentTemplate := `
	<table role="presentation" width="100%" style="border-spacing: 0;">
		<tr>
			<td style="padding-bottom: 6px; text-align: center;">
				<p style="margin: 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280;">来自 {{systemName}} 的安全通知</p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center; padding-bottom: 18px;">
				<p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">邮箱验证</p>
			</td>
		</tr>
		<tr>
			<td>
				<table role="presentation" width="100%" style="border-spacing: 0;">
					<tr>
						<td style="padding: 20px; background-color: #f4f8ff; border-radius: 12px; text-align: center; border: 1px solid #e0e7ff;">
							<p style="margin: 0 0 14px; font-size: 15px; line-height: 1.6; color: #334155;">为了保障您的账户安全，请在 {{minutes}} 分钟内输入以下验证码完成验证：</p>
							<div style="display: inline-block; padding: 14px 24px; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #1d4ed8; background-color: #ffffff; border-radius: 10px; border: 1px dashed #93c5fd;">{{code}}</div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr>
			<td style="padding-top: 20px; color: #6b7280; font-size: 13px; line-height: 1.6;">
				<p style="margin: 0 0 6px;">验证码过期请重新发起验证流程。</p>
				<p style="margin: 0;">如非本人操作，请忽略此邮件并检查您的账户安全。</p>
			</td>
		</tr>
	</table>`

	subject := fmt.Sprintf("%s邮箱验证邮件", systemName)
	content := strings.NewReplacer(
		"{{systemName}}", systemName,
		"{{minutes}}", strconv.Itoa(common.VerificationValidMinutes),
		"{{code}}", code,
	).Replace(contentTemplate)

	return stmp.Render(email, subject, content)
}

func SendQuotaWarningCodeEmail(userName, email string, quota int, noMoreQuota bool) error {
	stmp, err := GetSystemStmp()

	if err != nil {
		return err
	}

	contentTemp := `<p style="font-size: 30px">Hi <strong>%s,</strong></p>
		<p>
			%s，当前剩余额度为 %s，为了不影响您的使用，请及时充值。
		</p>

		<p style="text-align: center; font-size: 13px;">
			<a target="__blank" href="%s" class="button" style="color: #ffffff;">点击充值</a>
		</p>

		<p style="color: #858585; padding-top: 15px;">
			如果链接无法点击，请尝试点击下面的链接或将其复制到浏览器中打开<br> %s
		</p>`

	subject := "您的额度即将用尽"
	var quotaStr = "0"
	if noMoreQuota {
		subject = "您的额度已用尽"
	} else {
		quotaStr = fmt.Sprintf("＄%.6f ", float64(quota)/config.QuotaPerUnit)
	}
	topUpLink := fmt.Sprintf("%s/topup", config.ServerAddress)

	content := fmt.Sprintf(contentTemp, userName, subject, quotaStr, topUpLink, topUpLink)

	return stmp.Render(email, subject, content)
}

func DialAndSend(c *mail.Client, messages ...*mail.Msg) error {
	ctx := context.Background()
	if err := c.DialWithContext(ctx); err != nil {
		return fmt.Errorf("dial failed: %w", err)
	}
	defer c.Close()

	if err := c.Send(messages...); err != nil {
		if errors.Is(err, SendResetError) {
			return nil
		}
		return fmt.Errorf("send failed: %w", err)
	}
	return nil
}
