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
            className="border w-5/6 lg:w-1/2 mx-auto mt-2 border-dashed border-primary"
          >
            <input {...getInputProps()} />
            <p className="py-10 px-3 text-center flex flex-col justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 stroke-primary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Drag and drop the image you want to upload for your post.
            </p>
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
            className="w-36 h-36 object-cover"
          />
        </div>
      )}
      <button
        className="text-md mr-4 text-secondary  w-5/6 lg:w-1/2 flex justify-start items-start ml-10 md:ml-24 lg:ml-36"
        onClick={() => deleteImg()}
      >
        Delete Image
      </button>
    </>
  );
};

export default ImageDropZone;
