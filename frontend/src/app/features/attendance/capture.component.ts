import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AttendanceService } from '@core/services/attendance.service';

@Component({
  selector: 'app-capture',
  template: `
    <h4 class="page-title">Registro de Asistencia</h4>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card text-center">
          <div class="card-body">
            <div class="face-capture-box" (click)="triggerCamera()">
              <video #video autoplay playsinline *ngIf="cameraActive && !capturedImage"></video>
              <canvas #canvas style="display:none"></canvas>
              <img [src]="capturedImage" *ngIf="capturedImage">
              <div class="placeholder" *ngIf="!cameraActive && !capturedImage">
                <i class="bi bi-camera"></i>
                <p>Toca para capturar tu rostro</p>
              </div>
              <div class="face-guide" *ngIf="cameraActive"></div>
            </div>

            <div class="mt-3">
              <button class="btn btn-sacarf btn-lg me-2" *ngIf="cameraActive && !capturedImage"
                      (click)="capturePhoto()">
                <i class="bi bi-camera-fill me-2"></i>Capturar
              </button>
              <button class="btn btn-success btn-lg" *ngIf="capturedImage"
                      (click)="sendForRecognition()" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-circle-fill me-2"></i>Confirmar Asistencia
              </button>
              <button class="btn btn-outline-secondary ms-2" *ngIf="capturedImage"
                      (click)="resetCapture()">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>

            <div *ngIf="result" class="alert-card mt-3" [class.success]="result.success" [class.error]="!result.success">
              <i [class]="result.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              {{ result.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CaptureComponent implements AfterViewInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  cameraActive = false;
  capturedImage: string | null = null;
  imageBlob: Blob | null = null;
  loading = false;
  result: { success: boolean; message: string } | null = null;

  constructor(private attendanceService: AttendanceService) {}

  ngAfterViewInit(): void {
    this.activateCamera();
  }

  activateCamera(): void {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then(stream => {
          this.video.nativeElement.srcObject = stream;
          this.cameraActive = true;
        })
        .catch(() => { this.cameraActive = false; });
    }
  }

  triggerCamera(): void {
    if (!this.cameraActive) this.activateCamera();
  }

  capturePhoto(): void {
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      this.imageBlob = blob;
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    }, 'image/jpeg', 0.8);

    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    this.cameraActive = false;
  }

  sendForRecognition(): void {
    if (!this.imageBlob) return;
    this.loading = true;
    this.result = null;

    const file = new File([this.imageBlob], 'capture.jpg', { type: 'image/jpeg' });

    this.attendanceService.captureAttendance(file).subscribe({
      next: res => {
        this.result = { success: true, message: res.detail || 'Asistencia registrada correctamente' };
        this.loading = false;
      },
      error: err => {
        this.result = { success: false, message: err.message || 'Error al registrar asistencia' };
        this.loading = false;
      },
    });
  }

  resetCapture(): void {
    this.capturedImage = null;
    this.imageBlob = null;
    this.result = null;
    this.activateCamera();
  }
}
