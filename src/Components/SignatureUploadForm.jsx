import { useState } from "react";

const SignatureUploadForm = ({ onSignatureUpload }) => {
  const [signatureImage, setSignatureImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setSignatureImage(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (signatureImage) {
      // Llama a la función proporcionada para manejar la carga de la firma
      onSignatureUpload(signatureImage);
    }
  };

  return (
    <div>
      <h3 className="text-xl text-green-900">Por favor cargue la firma</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {signatureImage && (
        <div>
          <img
            src={signatureImage}
            alt="Vista previa de la firma"
            style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "10px" }}
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        style={{
          backgroundColor: "#088737",
          color: "white",
          padding: "10px",
          cursor: "pointer",
          margin: "20px",
          borderRadius: "10px",
        }}
      >
        Subir Firma
      </button>
    </div>
  );
};

export default SignatureUploadForm;
