/// <reference types="w3c-web-usb" />

declare global {
  interface Navigator {
    usb: USB;
  }
}

export {};
