import { Injectable } from '@angular/core';

export interface Theme {
  name: string;
  displayName: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: string = 'purple';
  
  private themes: Theme[] = [
    { name: 'purple', displayName: 'Purple', cssClass: 'theme-purple' },
    { name: 'blue', displayName: 'Blue', cssClass: 'theme-blue' },
    { name: 'green', displayName: 'Green', cssClass: 'theme-green' }
  ];

  constructor() {
    // Load saved theme on service initialization
    this.loadSavedTheme();
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  setTheme(themeName: string): void {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      // Remove existing theme classes
      this.themes.forEach(t => {
        document.documentElement.classList.remove(t.cssClass);
      });
      
      // Add new theme class
      document.documentElement.classList.add(theme.cssClass);
      
      // Save theme preference
      this.currentTheme = themeName;
      localStorage.setItem('app-theme', themeName);
      
      console.log(`Theme changed to: ${theme.displayName}`);
    }
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Set default theme
      this.setTheme('purple');
    }
  }

  // Method to easily change colors in the future
  updateThemeColors(themeName: string, colors: { [key: string]: string }): void {
    const root = document.documentElement;
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Save custom colors
    localStorage.setItem(`custom-theme-${themeName}`, JSON.stringify(colors));
  }

  // Method to reset to default theme colors
  resetThemeColors(themeName: string): void {
    localStorage.removeItem(`custom-theme-${themeName}`);
    this.setTheme(themeName);
  }
}
