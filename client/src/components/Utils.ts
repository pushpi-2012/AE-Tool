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
    
    const resStatus = await (await fetch('http://localhost:4001/output/status?'+new URLSearchParams({name:jsonObject.project.name, id:jsonObject.project.unit}))).json();
    return new Promise((resolve, reject)=>{
        resolve({msg:resStatus.msg,fname:resStatus.fname});
    });
}

export const videoExist = async(name:string, id:string) => {
    const resStatus = await (await fetch('http://localhost:4001/find_video?'+new URLSearchParams({name:name, id:id}))).json();
    return new Promise((resolve, reject) => {
        resolve({exist:resStatus.found, name:resStatus.name});
    })
}