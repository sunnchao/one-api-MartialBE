package relay_util

import (
	"encoding/json"
	"errors"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"
	"sort"
	"strings"
	"sync"

	"github.com/spf13/viper"
)

// PricingInstance is the Pricing instance
var PricingInstance *Pricing

// Pricing is a struct that contains the pricing data
type Pricing struct {
	sync.RWMutex
	Prices map[string]map[string]*model.Price `json:"models"`
	Match  []string                           `json:"-"`
}

type BatchPrices struct {
	Models []string    `json:"models" binding:"required"`
	Price  model.Price `json:"price" binding:"required"`
}

// NewPricing creates a new Pricing instance
func NewPricing() {
	logger.SysLog("Initializing Pricing")

	PricingInstance = &Pricing{
		Prices: make(map[string]map[string]*model.Price),
		Match:  make([]string, 0),
	}

	err := PricingInstance.Init()

	if err != nil {
		logger.SysError("Failed to initialize Pricing:" + err.Error())
		return
	}

	// 初始化时，需要检测是否有更新
	if viper.GetBool("auto_price_updates") || len(PricingInstance.Prices) == 0 {
		logger.SysLog("Checking for pricing updates")
		prices := model.GetDefaultPrice()
		PricingInstance.SyncPricing(prices, false)
		logger.SysLog("Pricing initialized")
	}
}

// initializes the Pricing instance
func (p *Pricing) Init() error {
	prices, err := model.GetAllPrices()
	if err != nil {
		return err
	}

	if len(prices) == 0 {
		return nil
	}

	newPrices := make(map[string]map[string]*model.Price)
	newMatch := make(map[string]bool)

	for _, price := range prices {
		if _, ok := newPrices[price.TokenGroup]; !ok {
			newPrices[price.TokenGroup] = make(map[string]*model.Price)
		}
		newPrices[price.TokenGroup][price.Model] = price
		if strings.HasSuffix(price.Model, "*") {
			if _, ok := newMatch[price.Model]; !ok {
				newMatch[price.Model] = true
			}
		}
	}

	var newMatchList []string
	for match := range newMatch {
		newMatchList = append(newMatchList, match)
	}

	p.Lock()
	defer p.Unlock()

	p.Prices = newPrices
	p.Match = newMatchList

	return nil
}

// GetPrice returns the price of a model
func (p *Pricing) GetPrice(modelName string, tokenGroup string) *model.Price {
	p.RLock()
	defer p.RUnlock()

	if groupPrices, ok := p.Prices[tokenGroup]; ok {
		if price, ok := groupPrices[modelName]; ok {
			return price
		}
	}

	if groupPrices, ok := p.Prices["default"]; ok {
		if price, ok := groupPrices[modelName]; ok {
			return price
		}
	}

	matchModel := utils.GetModelsWithMatch(&p.Match, modelName)
	if groupPrices, ok := p.Prices[tokenGroup]; ok {
		if price, ok := groupPrices[matchModel]; ok {
			return price
		}
	}

	if groupPrices, ok := p.Prices["default"]; ok {
		if price, ok := groupPrices[matchModel]; ok {
			return price
		}
	}

	return &model.Price{
		Type:        model.TokensPriceType,
		ChannelType: config.ChannelTypeUnknown,
		Input:       model.DefaultPrice,
		Output:      model.DefaultPrice,
		TokenGroup:  "default",
	}
}

func (p *Pricing) GetAllPrices() map[string]map[string]*model.Price {
	return p.Prices
}

func (p *Pricing) GetAllPricesList() []*model.Price {
	var prices []*model.Price
	for _, groupPrices := range p.Prices {
		for _, price := range groupPrices {
			prices = append(prices, price)
		}
	}

	return prices
}

func (p *Pricing) updateRawPrice(tokenGroup, modelName string, price *model.Price) error {
	if _, ok := p.Prices[tokenGroup]; !ok {
		return errors.New("token group not found")
	}
	if _, ok := p.Prices[tokenGroup][modelName]; !ok {
		return errors.New("model not found")
	}

	if _, ok := p.Prices[price.TokenGroup][price.Model]; modelName != price.Model && ok {
		return errors.New("model names cannot be duplicated")
	}

	if err := p.deleteRawPrice(tokenGroup, modelName); err != nil {
		return err
	}

	return price.Insert()
}

// UpdatePrice updates the price of a model
func (p *Pricing) UpdatePrice(tokenGroup, modelName string, price *model.Price) error {

	if err := p.updateRawPrice(tokenGroup, modelName, price); err != nil {
		return err
	}

	err := p.Init()

	return err
}

func (p *Pricing) addRawPrice(price *model.Price) error {
	if _, ok := p.Prices[price.TokenGroup]; !ok {
		p.Prices[price.TokenGroup] = make(map[string]*model.Price)
	}
	if _, ok := p.Prices[price.TokenGroup][price.Model]; ok {
		return errors.New("model already exists")
	}

	return price.Insert()
}

// AddPrice adds a new price to the Pricing instance
func (p *Pricing) AddPrice(price *model.Price) error {
	if err := p.addRawPrice(price); err != nil {
		return err
	}

	err := p.Init()

	return err
}

func (p *Pricing) deleteRawPrice(tokenGroup, modelName string) error {
	if _, ok := p.Prices[tokenGroup]; !ok {
		return errors.New("token group not found")
	}
	item, ok := p.Prices[tokenGroup][modelName]
	if !ok {
		return errors.New("model not found")
	}

	return item.Delete()
}

// DeletePrice deletes a price from the Pricing instance
func (p *Pricing) DeletePrice(tokenGroup, modelName string) error {
	if err := p.deleteRawPrice(tokenGroup, modelName); err != nil {
		return err
	}

	err := p.Init()

	return err
}

// SyncPricing syncs the pricing data
func (p *Pricing) SyncPricing(pricing []*model.Price, overwrite bool) error {
	var err error
	if overwrite {
		err = p.SyncPriceWithOverwrite(pricing)
	} else {
		err = p.SyncPriceWithoutOverwrite(pricing)
	}

	return err
}

// SyncPriceWithOverwrite syncs the pricing data with overwrite
func (p *Pricing) SyncPriceWithOverwrite(pricing []*model.Price) error {
	tx := model.DB.Begin()

	err := model.DeleteAllPrices(tx)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = model.InsertPrices(tx, pricing)

	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	return p.Init()
}

// SyncPriceWithoutOverwrite syncs the pricing data without overwrite
func (p *Pricing) SyncPriceWithoutOverwrite(pricing []*model.Price) error {
	var newPrices []*model.Price

	for _, price := range pricing {
		if _, ok := p.Prices[price.TokenGroup]; !ok {
			newPrices = append(newPrices, price)
		} else if _, ok := p.Prices[price.TokenGroup][price.Model]; !ok {
			newPrices = append(newPrices, price)
		}
	}

	if len(newPrices) == 0 {
		return nil
	}

	tx := model.DB.Begin()
	err := model.InsertPrices(tx, newPrices)

	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	return p.Init()
}

// BatchDeletePrices deletes the prices of multiple models
func (p *Pricing) BatchDeletePrices(tokenGroup string, models []string) error {
	tx := model.DB.Begin()

	err := model.DeletePrices(tx, models, tokenGroup)
	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	p.Lock()
	defer p.Unlock()

	if groupPrices, ok := p.Prices[tokenGroup]; ok {
		for _, model := range models {
			delete(groupPrices, model)
		}
	}

	return nil
}

func (p *Pricing) BatchSetPrices(tokenGroup string, batchPrices *BatchPrices, originalModels []string) error {
	// 查找需要删除的model
	var deletePrices []string
	var addPrices []*model.Price
	var updatePrices []string

	for _, model := range originalModels {
		if !utils.Contains(model, batchPrices.Models) {
			deletePrices = append(deletePrices, model)
		} else {
			updatePrices = append(updatePrices, model)
		}
	}

	for _, model := range batchPrices.Models {
		if !utils.Contains(model, originalModels) {
			addPrice := batchPrices.Price
			addPrice.Model = model
			addPrice.TokenGroup = tokenGroup
			addPrices = append(addPrices, &addPrice)
		}
	}

	tx := model.DB.Begin()
	if len(addPrices) > 0 {
		err := model.InsertPrices(tx, addPrices)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	if len(updatePrices) > 0 {
		err := model.UpdatePrices(tx, updatePrices, &batchPrices.Price, tokenGroup)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	if len(deletePrices) > 0 {
		err := model.DeletePrices(tx, deletePrices, tokenGroup)
		if err != nil {
			tx.Rollback()
			return err
		}

	}
	tx.Commit()

	return p.Init()
}

func GetPricesList(pricingType string) []*model.Price {
	var prices []*model.Price

	switch pricingType {
	case "default":
		prices = model.GetDefaultPrice()
	case "db":
		prices = PricingInstance.GetAllPricesList()
	case "old":
		prices = GetOldPricesList()
	default:
		return nil
	}

	sort.Slice(prices, func(i, j int) bool {
		if prices[i].ChannelType == prices[j].ChannelType {
			return prices[i].Model < prices[j].Model
		}
		return prices[i].ChannelType < prices[j].ChannelType
	})

	return prices
}

func GetOldPricesList() []*model.Price {
	oldDataJson, err := model.GetOption("ModelRatio")
	if err != nil || oldDataJson.Value == "" {
		return nil
	}

	oldData := make(map[string][]float64)
	err = json.Unmarshal([]byte(oldDataJson.Value), &oldData)

	if err != nil {
		return nil
	}

	var prices []*model.Price
	for modelName, oldPrice := range oldData {
		price := PricingInstance.GetPrice("default", modelName)
		prices = append(prices, &model.Price{
			Model:       modelName,
			Type:        model.TokensPriceType,
			ChannelType: price.ChannelType,
			Input:       oldPrice[0],
			Output:      oldPrice[1],
		})
	}

	return prices
}
