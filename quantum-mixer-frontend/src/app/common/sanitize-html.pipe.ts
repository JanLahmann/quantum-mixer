import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml|null {
    if(!value) {
      return null;
    }
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

}
