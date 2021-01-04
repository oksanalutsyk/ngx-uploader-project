import { Component, EventEmitter } from '@angular/core';
import {
  UploadOutput,
  UploadInput,
  UploadFile,
  humanizeBytes,
  UploaderOptions,
} from 'ngx-uploader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  data = {};

  constructor() {
    this.options = {
      concurrency: 0,
      maxUploads: 5,
      maxFileSize: 1000000000,
      allowedContentTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/zip',
        'text/plain',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msexcel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
    };
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {
    console.log(output);
    this.data = output;
    switch (output.type) {
      case 'allAddedToQueue':
        break;
      case 'addedToQueue':
        if (typeof output.file !== 'undefined') {
          this.files.push(output.file);
        }
        this.startUpload();
        break;
      case 'uploading':
        if (typeof output.file !== 'undefined') {
          const index = this.files.findIndex(
            (file) =>
              typeof output.file !== 'undefined' && file.id === output.file.id
          );
          this.files[index] = output.file;
        }
        break;
      case 'removed':
        this.files = this.files.filter(
          (file: UploadFile) => file !== output.file
        );
        break;
      case 'removedAll':
        this.files = [];
        break;
      case 'dragOver':
        this.dragOver = true;
        break;
      case 'dragOut':
      case 'drop':
        this.dragOver = false;
        break;
      case 'done':
        break;
    }
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: 'http://ngx-uploader.com/upload',
      method: 'POST',
      data: this.data,
    };

    this.uploadInput.emit(event);
    console.log(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
    console.log(id);
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }
}
