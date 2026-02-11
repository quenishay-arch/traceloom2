//
//  utils.js
//  traceloom
//
//  Created by Quenisha Yovela on 11/2/2026.
//


import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;
