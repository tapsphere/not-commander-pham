import { useEffect } from "react";
import { useParams } from "react-router-dom";

const DemoRedirect = () => {
  const { demoFile } = useParams();
  
  useEffect(() => {
    // Perform a full page load to access the static HTML file
    window.location.href = `/demo/${demoFile}`;
  }, [demoFile]);
  
  return null;
};

export default DemoRedirect;
