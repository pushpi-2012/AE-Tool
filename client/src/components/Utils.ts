export const uploadFiles = async(imageData:any, videoData:any, jsonObject:any) => {    
    await fetch("http://localhost:4001/upload_images", {
        method: 'POST',
        body: imageData,
    });

    await fetch("http://localhost:4001/upload_videos", {
        method: 'POST',
        body: videoData,
    });

    await fetch('http://localhost:4001/json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonObject),
    });
    
    const resStatus = await (await fetch('http://localhost:4001/output/status?'+new URLSearchParams({fname:jsonObject.project.unit}))).json();
    console.log(resStatus);
    return new Promise((resolve, reject)=>{
        resolve({msg:resStatus.msg,fname:resStatus.fname});
    })
}