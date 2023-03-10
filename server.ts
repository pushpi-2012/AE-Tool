import * as fs from 'fs';
import * as fse from 'fs-extra'
import * as path from 'path';
import * as open from "open";

const multer = require('multer');
import * as watch from 'node-watch';
import * as child from 'child_process';
import * as chokidar from 'chokidar';

import express, { Express, Request, Response } from 'express';

import cors from "cors";

class Server {
	//check the port if not found set it to '5000' then start the server//
	private port:string | number;
	
	private isWin:boolean;
	private currentPath:string;
	private app:Express = express();
	
	private dirname:string = "";
	private appStatus:string = "init";
	//private fileStatus:string = "init";
	
	constructor(){
		this.port = process.env.PORT || 4001;
		this.isWin = process.platform === "win32";
		this.currentPath = __dirname.replace(/\\/g, '/');
		
		this.app.use(express.json());
		//this.app.use(cors());
		this.app.use(cors<Request>());
		this.app.use('/output', express.static("output")); 
		this.app.use('/assets', express.static('assets'));
		//this.app.use(express.static(__dirname + "/jsonBuilder/"));
		this.routers();
		this.initilize();
	}
	
	private routers = async() => {
		this.app.post('/json', async(req:Request, res:Response) => {
			const json = req.body;
			let unitName = json.project.unit;
			try {
				fs.writeFileSync(`./ae/units/${unitName}/data.json`, JSON.stringify(req.body));
				await fse.ensureDir(`./output/${unitName}`);

				//this.fileStatus = "init";
				this.writeBatch(`ae/units/${unitName}`);
				res.status(200).json({msg:'success'});
			} catch (err) {
				console.error(err);
			}
		});

		this.app.get('/output/status', (req:Request, res:Response) => {
			const watcher = chokidar.watch(`output/${req.query.fname}`, {ignored: /^\./, persistent: false});
			watcher.on('add', (filename:string) => {
				if(filename.split('.').length === 2 && filename.split('.')[1] === "mp4"){
					watcher.close().then(() => {
						setTimeout(async()=>{
							const vpath:string = this.currentPath+"/"+filename.replace(/\\/g, '/');
							//temperory line of code to overcome chrome local assets loading problem//
							await fse.copy(filename.replace(/\\/g, '/'), "./client/src/assets/preview.mp4");
							res.status(200).json({msg:'published', fname:vpath});
						}, 2000);
					})
				}
			})
		});

		const storage = multer.diskStorage({
			destination: function (req:any, file:any, cb:any) {
				cb(null, './uploads')
			},
			filename: function (req:any, file:any, cb:any) {
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
				cb(null, file.fieldname + '-' + uniqueSuffix)
			}
		})

		const upload = multer({
			storage: storage,
			fileFilter: (req:any, file:any, cb:any) => {
				if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif" || file.mimetype == "video/mp4") {
					cb(null, true);
				} else {
					cb(null, false);
					return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
				}
			}
		})

		this.app.post("/upload_images", upload.array('image'), async(req:any, res:Response)=>{
			await fse.ensureDir(`./ae/units/${req.body['folder']}/assets`);
			req.files.forEach((file:any, index:number) => {
				const tempPath:string = file.path;
				const fileName:string = `image_${index+1}${path.extname(file.originalname)}`;
				const targetPath:string = path.join(__dirname, `./ae/units/${req.body['folder']}/assets/${fileName}`);

				fs.rename(tempPath, targetPath, err => {
					if (err) {
						console.log(err);
						return res.status(400).contentType("text/plain").end("some error while uploading files");
					}
				})
			});

			res.status(200).contentType("text/plain").end("images uploaded!");
		});

		this.app.post("/upload_videos", upload.array('video'), async(req:any, res:Response) => {
			await fse.ensureDir(`./ae/units/${req.body['folder']}/assets/videos`);
			
			req.files.forEach((file:any, index:number) => {
				const tempPath:string = file.path;
				const fileName:string = `video_${index+1}${path.extname(file.originalname)}`;
				const targetPath:string = path.join(__dirname, `./ae/units/${req.body['folder']}/assets/videos/${fileName}`);

				fs.rename(tempPath, targetPath, err => {
					if (err) {
						console.log(err);
						return res.status(400).contentType("text/plain").end("some error while uploading files");
					}
				})
			});

			res.status(200).contentType("text/plain").end("videos uploaded!");
		})


		this.app.listen(this.port, ()=>{
			console.log(`the server is running on port ${this.port}`);
		});
	}
	
	private openBrowser = (url:string):void => {
		var start:string = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
		child.exec(start + ' ' + url);
	}

	private initilize = ():void => {
		var url:string = `http://localhost:${this.port}`;
		//this.openBrowser(url);
	}
	
	private runBatch = ():void => {
		var ls:child.ChildProcess = this.isWin ? child.exec(require.resolve('./ae/build.bat')) 
			: child.exec(`arch -x86_64 osascript ${this.currentPath}/ae/buildm.scpt`);
		
		ls.addListener("error", (code:any) => {
			console.log('child process exited with code ' + code);
		});
		ls.addListener("exit", (code:any) => {
			console.log('child process exited with code ' + code);
		});
	}
	
	private writeBatch = (filename:string):void => {
		let values:string = filename.replace(/\\/g, '/').trim()+"|"+this.currentPath.trim();
		if(this.isWin){
			let data:string = `"afterfx.exe" -s "var values='${values}'; $.evalFile("${this.currentPath}/ae/template.jsx")"`;
			//let data:string = `afterfx.exe -s "loaded('${values}'); $.evalFile('${this.currentPath}/ae/template.jsx')"`;
			fs.writeFileSync('./ae/build.bat', data);
		}else{
			let data = `tell application "Adobe After Effects 2023"
	DoScript "var values='${values}'"
	DoScriptFile "${this.currentPath}/ae/template.jsx"
end tell`;
			fs.writeFileSync(this.currentPath+'/ae/buildm.scpt', data);
		}

		console.log("***Batch file written location successfully***");
		this.runBatch();
	}
	
	private watchFolders = (fname:string):void => {
		if(this.appStatus !== "init"){
			return
		}
		
		this.appStatus = "init";
		/* chokidar.watch('./ae/units', {ignored: /^\./, persistent: false, depth:0})
		.on('addDir', (filename:string) => {
			var fname:string = filename.replace(/(\/|\\)/g, '|').replace('aeunits','');
			console.log(filename, fname)
			if(fname.split("|")[2] && this.fileStatus === "init"){
				this.fileStatus = "loaded";
				this.writeBatch(filename);
			}
		}); */
		
		/* chokidar.watch('./output', {ignored: /^\./, persistent: false})
		.on('add', (filename:string) => {
			console.log(filename)
			if(filename.split('.').length == 2 && filename.split('.')[1] === "mp4"){
				console.log(this.dirname);
				if(this.dirname != filename){
					let mtime:number;
					fs.stat(filename, (error, stats)=> {
						mtime = stats.mtimeMs;
						if(this.creationTime > mtime){
							this.openBrowser(`http://localhost:${this.port}/?path=${filename}`);
						}
					});
				}
				this.dirname = filename;
			}
		}); */
	}
}

const server:Server = new Server();