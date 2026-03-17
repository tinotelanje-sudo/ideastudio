/**
 * Firmware Service for IDEAI STUDIOS
 * Handles backup and restoration of device firmware/configurations via WebUSB.
 */

export interface BackupResult {
  data: Blob;
  filename: string;
  timestamp: string;
}

export const backupFirmware = async (device: USBDevice): Promise<BackupResult> => {
  try {
    // 1. Open and select configuration if not already done
    if (!device.opened) {
      await device.open();
    }
    
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // 2. Claim interface (usually 0 for simple devices)
    await device.claimInterface(0);

    // 3. Simulate reading firmware data
    // In a real scenario, you would loop through transferIn calls
    // or use a specific protocol like DFU (Device Firmware Upgrade).
    
    // For demonstration, we'll create a dummy binary blob representing the "cloned" state
    const dummyData = new TextEncoder().encode(`FIRMWARE_BACKUP_${device.serialNumber}_${Date.now()}`);
    const blob = new Blob([dummyData], { type: 'application/octet-stream' });
    
    const timestamp = new Date().toISOString();
    const filename = `backup_${device.productName?.replace(/\s+/g, '_')}_${device.serialNumber}.bin`;

    return {
      data: blob,
      filename,
      timestamp
    };
  } catch (error) {
    console.error('Backup failed:', error);
    throw new Error('Failed to read device firmware. Ensure the device is in a readable state.');
  } finally {
    try {
      await device.releaseInterface(0);
    } catch (e) { /* Ignore */ }
  }
};

export const restoreFirmware = async (device: USBDevice, file: File): Promise<void> => {
  try {
    if (!device.opened) {
      await device.open();
    }
    
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    await device.claimInterface(0);

    // Read the file content
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // 4. Simulate writing firmware data
    // In a real scenario, you would use transferOut in chunks
    console.log(`Restoring ${data.length} bytes to ${device.productName}...`);
    
    // Artificial delay to simulate writing process
    await new Promise(resolve => setTimeout(resolve, 2000));

    return;
  } catch (error) {
    console.error('Restore failed:', error);
    throw new Error('Failed to restore firmware. The device may have disconnected or is write-protected.');
  } finally {
    try {
      await device.releaseInterface(0);
    } catch (e) { /* Ignore */ }
  }
};
