package common

import (
  cryptoRand "crypto/rand"
  "math/big"
  "sync"
  "time"
)

type verificationValue struct {
  code string
  time time.Time
}

const (
  EmailVerificationPurpose = "v"
  PasswordResetPurpose     = "r"
)

var verificationMutex sync.Mutex
var verificationMap map[string]verificationValue
var verificationMapMaxSize = 10
var VerificationValidMinutes = 10

const defaultVerificationCodeLength = 6

func GenerateVerificationCode(length int) string {
  if length <= 0 {
    length = defaultVerificationCodeLength
  }

  digits := make([]byte, length)
  max := big.NewInt(10)

  for i := 0; i < length; i++ {
    n, err := cryptoRand.Int(cryptoRand.Reader, max)
    if err != nil {
      // crypto/rand should rarely fail; fallback to '0'
      digits[i] = '0'
      continue
    }
    digits[i] = '0' + byte(n.Int64())
  }

  return string(digits)
}

func RegisterVerificationCodeWithKey(key string, code string, purpose string) {
  verificationMutex.Lock()
  defer verificationMutex.Unlock()
  verificationMap[purpose+key] = verificationValue{
    code: code,
    time: time.Now(),
  }
  if len(verificationMap) > verificationMapMaxSize {
    removeExpiredPairs()
  }
}

func VerifyCodeWithKey(key string, code string, purpose string) bool {
  verificationMutex.Lock()
  defer verificationMutex.Unlock()
  value, okay := verificationMap[purpose+key]
  now := time.Now()
  if !okay || int(now.Sub(value.time).Seconds()) >= VerificationValidMinutes*60 {
    return false
  }
  return code == value.code
}

func DeleteKey(key string, purpose string) {
  verificationMutex.Lock()
  defer verificationMutex.Unlock()
  delete(verificationMap, purpose+key)
}

// no lock inside, so the caller must lock the verificationMap before calling!
func removeExpiredPairs() {
  now := time.Now()
  for key := range verificationMap {
    if int(now.Sub(verificationMap[key].time).Seconds()) >= VerificationValidMinutes*60 {
      delete(verificationMap, key)
    }
  }
}

func init() {
  verificationMutex.Lock()
  defer verificationMutex.Unlock()
  verificationMap = make(map[string]verificationValue)
}
