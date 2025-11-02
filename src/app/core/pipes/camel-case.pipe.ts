import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCase',
  standalone: true
})
export class CamelCasePipe implements PipeTransform {
  
  /**
   * Transforms a string to camel case (capitalizes first letter of each word)
   * @param value - The string to transform
   * @returns The transformed string with each word capitalized
   * 
   * Examples:
   * 'john paul' -> 'John Paul'
   * 'JOHN PAUL' -> 'John Paul'
   * 'john' -> 'John'
   */
  transform(value: string): string {
    if (!value) return value;
    
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}


