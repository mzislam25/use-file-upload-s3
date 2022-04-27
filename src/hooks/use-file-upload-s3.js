import { useState, useEffect } from 'react';
import axios from 'axios';

const useFileUploadS3 = (API_ENDPOINT, TOKEN,  MAX_IMAGE_SIZE=1000000) => {
    const [data, setData] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(null);
    const [progress, setProgress] = useState(0);
    
    const clearError = () => {
        setData(null);
        setFileData(null);
        setIsError(null);
        setProgress(0);
    };

    const readFile = (file) => {
        let reader = new FileReader()
        reader.onload = (e) => {
          if (!e.target.result.includes('data:image/jpeg')) {
            setFileData(null);
            return setIsError('Wrong file type - JPG only.');
          }
          if (e.target.result.length > MAX_IMAGE_SIZE) {
            setFileData(null);
            return setIsError('Image is loo large.');
        }
          setFileData(e.target.result);
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        const uploadData =  async () => {
            if(fileData){
                setIsLoading(true);
                try {
                    const response = await axios({
                        method: 'GET',
                        headers: {
                            authorization: `Bearer ${TOKEN}`
                        },
                        url: API_ENDPOINT,
                        onDownloadProgress:(p)=>{
                            setProgress(parseInt((p.loaded/p.total)*50));
                        }
                    }).then(response=>response.data);
                    // console.log('Response: ', response)
                    let binary = atob(fileData.split(',')[1])
                    let array = []
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i))
                    }
                    let blobData = new Blob([new Uint8Array(array)], {type: 'image/jpeg'})
                    // console.log('Uploading to: ', response.uploadURL,blobData);
                    // const result = await fetch(response.uploadURL, {
                    //     method: 'PUT',
                    //     body: blobData
                    // })
                    await axios({
                        method: 'PUT',
                        data: blobData,
                        headers: {
                            "Content-Type": 'image/jpeg'
                        },
                        onUploadProgress: (p)=>{
                            setProgress(50+parseInt((p.loaded/p.total)*50));
                        },
                        url: response.uploadURL,
                    })
                    // console.log('Result: ', result)
                    setData(response.uploadURL.split('?')[0])
                    setIsLoading(false);
                } catch (error) {
                    setFileData(null);
                    setIsError(error);
                    setIsLoading(false);    
                }
            }else{
                setIsError('Required field missing');
            }
        }
        fileData && uploadData();
    }, [API_ENDPOINT, TOKEN, fileData]);

  return [
    { fileData, data, isLoading, isError, progress },
    readFile,
    clearError
  ];
}

export default useFileUploadS3;