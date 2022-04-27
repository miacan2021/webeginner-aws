import React from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  file?: File | string | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | string | undefined>>;
  setFileType: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ImageDropZone = ({ file, setFile, setFileType }: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setFileType(acceptedFiles[0].type);
    },
  });
  console.log(file);
  const deleteImg = () => {
    setFile("");
  };

  return (
    <>
      {!file ? (
        <section
          className="container"
          style={{
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.5)",
            minHeight: 128,
          }}
        >
          <div
            {...getRootProps({ className: "dropzone" })}
            style={{ padding: 16 }}
          >
            <input {...getInputProps()} />
            <h1>Drag and drop the image you want to upload for your post.</h1>
          </div>
        </section>
      ) : (
        <div
          {...getRootProps({ className: "dropzone" })}
          style={{ padding: 16 }}
        >
          <input {...getInputProps()} />
          <img
            src={
              typeof file === "string"
                ? file
                : URL.createObjectURL(file as File)
            }
            alt="postimage"
          />
        </div>
      )}
      <button className="text-sm mr-4 text-red-500" onClick={() => deleteImg()}>
        Delete Image
      </button>
    </>
  );
};

export default ImageDropZone;
