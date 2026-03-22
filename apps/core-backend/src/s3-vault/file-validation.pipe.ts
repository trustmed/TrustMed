import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/** MIME types accepted for medical record uploads. */
const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/dicom',
    'text/plain',
]);

/**
 * Validates that the uploaded file has an allowed MIME type.
 *
 * Usage:
 * ```ts
 * @UploadedFile(new FileValidationPipe()) file: Express.Multer.File
 * ```
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File): Express.Multer.File {
        if (!file) {
            throw new BadRequestException('No file provided. Use form field "file".');
        }

        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new BadRequestException(
                `File type "${file.mimetype}" is not allowed. ` +
                `Accepted types: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
            );
        }

        return file;
    }
}
