import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'asRange'
})
export class AsRangePipe implements PipeTransform {

  transform(value: number): number[] {
    return Array<void>(value).fill().map((x,i) => i);
  }

}
