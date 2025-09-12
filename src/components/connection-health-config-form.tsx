"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { CustomConnectionHealthConfig } from "@/lib/meetingConfigs/types";

interface ConnectionHealthConfigFormProps {
  trigger?: React.ReactNode;
}

// AWS Chime SDK default values (from comments in cp.ts)
const awsDefaults = {
  connectionUnhealthyThreshold: 25,
  connectionWaitTimeMs: 10000,
  noSignalThresholdTimeMs: 10000,
  cooldownTimeMs: 60000,
  maximumTimesToWarn: 2,
  goodSignalTimeMs: 15000,
  oneBarWeakSignalTimeMs: 5000,
  twoBarsTimeMs: 5000,
  threeBarsTimeMs: 10000,
  fourBarsTimeMs: 20000,
  fiveBarsTimeMs: 60000,
  zeroBarsNoSignalTimeMs: 5000,
  fractionalLoss: 0.5,
  packetsExpected: 50,
  pastSamplesToConsider: 15,
  missedPongsLowerThreshold: 1,
  missedPongsUpperThreshold: 4,
  sendingAudioFailureInitialWaitTimeMs: 3000,
  sendingAudioFailureSamplesToConsider: 2,
};

const fieldLabels = {
  connectionUnhealthyThreshold: "Connection Unhealthy Threshold",
  connectionWaitTimeMs: "Connection Wait Time (ms)",
  noSignalThresholdTimeMs: "No Signal Threshold Time (ms)",
  cooldownTimeMs: "Cooldown Time (ms)",
  maximumTimesToWarn: "Maximum Times to Warn",
  goodSignalTimeMs: "Good Signal Time (ms)",
  oneBarWeakSignalTimeMs: "One Bar Weak Signal Time (ms)",
  twoBarsTimeMs: "Two Bars Time (ms)",
  threeBarsTimeMs: "Three Bars Time (ms)",
  fourBarsTimeMs: "Four Bars Time (ms)",
  fiveBarsTimeMs: "Five Bars Time (ms)",
  zeroBarsNoSignalTimeMs: "Zero Bars No Signal Time (ms)",
  fractionalLoss: "Fractional Loss",
  packetsExpected: "Packets Expected",
  pastSamplesToConsider: "Past Samples to Consider",
  missedPongsLowerThreshold: "Missed Pongs Lower Threshold",
  missedPongsUpperThreshold: "Missed Pongs Upper Threshold",
  sendingAudioFailureInitialWaitTimeMs: "Sending Audio Failure Initial Wait Time (ms)",
  sendingAudioFailureSamplesToConsider: "Sending Audio Failure Samples to Consider",
};

export function ConnectionHealthConfigForm({ trigger }: ConnectionHealthConfigFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomConnectionHealthConfig>>({});
  const [hasCustomValues, setHasCustomValues] = useState(false);

  // Load saved values from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chime-custom-connection-health');
      if (stored) {
        const parsedData = JSON.parse(stored);
        setFormData(parsedData);
        setHasCustomValues(true);
      }
    } catch (error) {
      console.warn('Failed to load custom connection health config from localStorage:', error);
    }
  }, []);

  const handleInputChange = (field: keyof CustomConnectionHealthConfig, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    try {
      // Filter out undefined values before saving
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== undefined)
      );
      
      localStorage.setItem('chime-custom-connection-health', JSON.stringify(dataToSave));
      setIsOpen(false);
      
      // Reload the page to reinitialize the meeting session
      window.location.reload();
    } catch (error) {
      console.error('Failed to save custom connection health config:', error);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('chime-custom-connection-health');
      setFormData({});
      setHasCustomValues(false);
      setIsOpen(false);
      
      // Reload the page to reinitialize with defaults
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset custom connection health config:', error);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Connection Settings
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connection Health Policy Configuration</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Override AWS Chime SDK connection health settings. Leave fields empty to use defaults.
            {hasCustomValues && <span className="text-blue-600 ml-2">Custom values are active</span>}
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <div key={field} className="grid gap-2">
              <Label htmlFor={field} className="text-sm">
                {label}
              </Label>
              <Input
                id={field}
                type="number"
                step={field === 'fractionalLoss' ? '0.1' : '1'}
                placeholder={`Default: ${awsDefaults[field as keyof typeof awsDefaults]}`}
                value={formData[field as keyof CustomConnectionHealthConfig] ?? ''}
                onChange={(e) => handleInputChange(field as keyof CustomConnectionHealthConfig, e.target.value)}
                className={formData[field as keyof CustomConnectionHealthConfig] !== undefined ? 'border-blue-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                AWS Default: {awsDefaults[field as keyof typeof awsDefaults]}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save & Reload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}