package image

import "math"

// ResolutionBucket represents a pricing bucket for image resolutions.
type ResolutionBucket struct {
	Name      string
	MaxPixels int
	Ratio     float64
}

var resolutionBuckets = []ResolutionBucket{
	{Name: "standard", MaxPixels: 1024 * 1024, Ratio: 1},  // up to 1MP
	{Name: "fhd", MaxPixels: 1920 * 1080, Ratio: 1.3},     // ~2MP (Full HD)
	{Name: "2k", MaxPixels: 2560 * 1440, Ratio: 1.5},      // ~3.6MP
	{Name: "4k", MaxPixels: 3840 * 2160, Ratio: 2},        // ~8.3MP
	{Name: "6k", MaxPixels: 6144 * 3160, Ratio: 2.5},      // ~19MP
	{Name: "8k", MaxPixels: 7680 * 4320, Ratio: 3},        // ~33MP
	{Name: "ultra", MaxPixels: math.MaxInt32, Ratio: 3.5}, // anything larger
}

// GetResolutionPricing returns the ratio multiplier and bucket name based on pixel count.
func GetResolutionPricing(width, height int) (ratio float64, bucket string) {
	if width <= 0 || height <= 0 {
		return 1, ""
	}

	pixels := width * height
	for _, bucket := range resolutionBuckets {
		if pixels <= bucket.MaxPixels {
			return bucket.Ratio, bucket.Name
		}
	}

	last := resolutionBuckets[len(resolutionBuckets)-1]
	return last.Ratio, last.Name
}
