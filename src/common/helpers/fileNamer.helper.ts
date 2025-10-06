import { v7 as uuid } from 'uuid';
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: string) => void,
) => {
  const fileExtension = file.mimetype.split('/')[1];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const fileName = `${uuid()}.${fileExtension}`;

  callback(null, fileName);
};
