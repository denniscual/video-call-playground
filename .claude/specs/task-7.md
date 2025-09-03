# Network Quality Detection Improvement for AWS Chime Video Calls

## Research

**Motivation**
The current network quality detection logic, @../../src/components/meeting.tsx `detectNetworkQuality` function uses OR conditions that cause premature video quality downgrades. When packet loss exceeds 3%, the system returns 'poor' quality even with excellent bandwidth (e.g., 10 Mbps), resulting in unnecessary video degradation and poor user experience during video calls.

**Investigation**
Analysis of the current implementation reveals:

- The detection function relies on `availableOutgoingBitrate` and `audioPacketLossPercent` metrics from AWS Chime's ClientMetricReport
- Current logic uses simple OR conditions: `if (uploadBandwidthKbps < 500 || (!isNaN(audioPacketLossPercent) && audioPacketLossPercent > 3)) return 'poor'`
- This approach creates false positives where high bandwidth connections are classified as poor due to temporary packet loss spikes
- The system lacks nuanced scoring that considers the relative importance of different network metrics

**Findings**

- AWS Chime SDK provides ClientMetricReport through the `metricsDidReceive` callback in AudioVideoObserver
- Multiple metrics are available including bandwidth, packet loss, latency, and jitter
- A weighted scoring system can better balance multiple network factors
- Bandwidth should be the primary factor with packet loss as a penalty modifier
- Critical threshold should be < 300 kbps and poor threshold should be 300-500 kbps (inclusive)

**Initial Solution**
Implement a composite scoring system that:

1. Assigns bandwidth scores on a 1-5 scale based on thresholds
2. Applies packet loss as a penalty (0-3 points) rather than a hard cutoff
3. Combines scores with `Math.max(1, bandwidthScore - packetLossPenalty)`
4. Maps final scores to network quality levels with special handling for low bandwidth scenarios

## Plan

**High-level Plan**

1. **Replace OR-condition logic with weighted scoring**

   - Implement bandwidth scoring with clear thresholds (critical: <300, poor: 300-500, fair: 501-799, good: 800-1199, excellent: ≥1200 kbps)
   - Add packet loss penalty system (0-3 points based on severity)
   - Combine scores to prevent overreaction to single metrics

2. **Enforce bandwidth-based boundaries**

   - Bandwidth < 300 kbps always returns 'critical' regardless of other metrics
   - Bandwidth 300-500 kbps can only return 'poor' or 'critical'
   - Bandwidth > 500 kbps uses full scoring range

3. **Integration approach**
   - Maintain compatibility with existing `NetworkQualityType` enum
   - Use existing ClientMetricReport API without additional dependencies
   - Preserve current function signature for backward compatibility

## Implementation

**Technical Implementation Plan**

- **Update detectNetworkQuality function**

```typescript
const detectNetworkQuality = (
  clientMetricReport: ClientMetricReport,
): NetworkQualityType => {
  // Extract metrics using existing API
  const availableOutgoingBitrate = clientMetricReport.getObservableMetricValue(
    "availableOutgoingBitrate",
  );
  const audioPacketLossPercent =
    clientMetricReport.getObservableMetricValue("audioPacketLossPercent") || 0;
  const uploadBandwidthKbps = availableOutgoingBitrate / 1000;

  // Implement bandwidth scoring (1-5 scale)
  let bandwidthScore = 0;
  if (uploadBandwidthKbps >= 1200)
    bandwidthScore = 5; // Excellent
  else if (uploadBandwidthKbps >= 800)
    bandwidthScore = 4; // Good
  else if (uploadBandwidthKbps > 500)
    bandwidthScore = 3; // Fair (501-799)
  else if (uploadBandwidthKbps >= 300)
    bandwidthScore = 2; // Poor (300-500 inclusive)
  else bandwidthScore = 1; // Critical (< 300)

  // Calculate packet loss penalty
  let packetLossPenalty = 0;
  if (audioPacketLossPercent > 5)
    packetLossPenalty = 3; // Severe
  else if (audioPacketLossPercent > 3)
    packetLossPenalty = 2; // Moderate
  else if (audioPacketLossPercent > 1) packetLossPenalty = 1; // Minor

  // Combine scores with floor of 1
  const finalScore = Math.max(1, bandwidthScore - packetLossPenalty);

  // Map to quality with bandwidth boundaries
  if (uploadBandwidthKbps < 300) return "critical";
  if (uploadBandwidthKbps <= 500) {
    return finalScore >= 2 ? "poor" : "critical";
  }

  // Standard scoring for bandwidth > 500
  if (finalScore >= 5) return "excellent";
  if (finalScore >= 4) return "good";
  if (finalScore >= 3) return "fair";
  if (finalScore >= 2) return "poor";
  return "critical";
};
```

- **Monitoring integration**
- Add logging for score components: console.log('video-logs', 'Network scoring', { uploadBandwidthKbps, audioPacketLossPercent, bandwidthScore, packetLossPenalty, finalScore, quality })
- Track quality changes through existing trackVideoCallEvent system
- Monitor distribution of quality levels in production
