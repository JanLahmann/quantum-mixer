import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'asRange'
})
export class AsRangePipe implements PipeTransform {

  transform(value: undefined | number | (number | undefined)[]): number[] {
    if(typeof value == 'undefined') {
      return [];
    }
    if(typeof value == 'number') {
      return Array<void>(value).fill().map((x,i) => i);
    }
    if(value[0] === undefined || value[1] === undefined) {
      return [];
    }
    return Array<void>(value[1] - value[0] + 1).fill().map((x,i) => i+value[0]!);
  }

}
