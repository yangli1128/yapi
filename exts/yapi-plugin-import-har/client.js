
import {message} from 'antd'

function json_format(json){
  try{
    return JSON.stringify(JSON.parse(json), null, '   ');
  }catch(e){
    return json;
  }
}

function postman(importDataModule){

  function parseUrl(url){
    let parser = document.createElement('a');
    parser.href = url;
    return {
      protocol: parser.protocol,
      hostname: parser.hostname,
      port: parser.port,  
      pathname: parser.pathname,
      search: parser.search,
      host: parser.host
    }
  }
  
  function checkInterRepeat(interData){
    let obj = {};
    let arr = [];
    for(let item in interData){
      // console.log(interData[item].url + "-" + interData[item].method);
      let key = interData[item].request.url + "|" + interData[item].request.method;
      if(!obj[key]){
        arr.push(interData[item]);
        obj[key] = true;
      }
    }
    return arr;
  }
  
  function handleReq_query(query){
    let res = [];
    if(query&&query.length){
      for(let item in query){
        res.push({
          name: query[item].name
        });
      }
    }
    return res;
  }
  // function handleReq_headers(headers){
  //   let res = [];
  //   if(headers&&headers.length){
  //     for(let item in headers){
  //       res.push({
  //         name: headers[item].key,
  //         desc: headers[item].description,
  //         value: headers[item].value,
  //         required: headers[item].enable
  //       });
  //     }
  //   }
  //   return res;
  // }
  
  function handleReq_body_form(body_form){
    let res = [];
    if(body_form && typeof body_form === 'object'){
      for(let item in body_form){
        res.push({
          name: body_form[item].name,
          type: 'text'
        });
      }
    }
    return res;
  }
  
  function handlePath(path){
    path = path.replace(/{{(\w*)}}/,"");
    path = parseUrl(path).pathname;
    if(path.charAt(0) != "/"){
      path = "/" + path;
    }
    if(path.charAt(path.length-1) === "/"){
      path = path.substr(0,path.length-1);
    }
    return path;
  }
  
  function run(res){    
    try{
      res = JSON.parse(res);
      res = res.log.entries;
      res = res.filter(item=>{
        if(!item)return false;
        return item.response.content.mimeType.indexOf('application/json') === 0;
      })


      let interfaceData = {apis: []};
      res = checkInterRepeat.bind(this)(res);
      if(res && res.length){ 
        for(let item in res){
          let data = importHar.bind(this)(res[item]);
          interfaceData.apis.push(data);
        }
      }
      return interfaceData;
      
    }catch(e){
      console.error(e);
      message.error("数据格式有误");
    }
    
  }
  
  function importHar(data,key){
    let reflect = {//数据字段映射关系
      title: "url",
      path: "url",
      method: "method",
      desc: "description",
      req_query: "queryString",
      req_body_form: "params",
      req_body_other: "text"
    };
    let allKey = ["title","path","method","req_query","req_body_type","req_body_form","req_body_other", "res_body_type", "res_body","req_headers"];
    key = key || allKey;
    let res = {};

    let reqType = 'json', header;
    data.request.headers.forEach(item=>{
      if(!item ||item.name ||item.value) return null;
      if(/content-type/i.test(item.name) && item.value.index('application/json') === 0){
        reqType = 'json';
        header = 'application/json';
      }else if(/content-type/i.test(item.name) && item.value.index('application/x-www-form-urlencoded') === 0){
        header = 'application/x-www-form-urlencoded'
        reqType = 'form';
      }else if(/content-type/i.test(item.name) && item.value.index('multipart/form-data') === 0){
        header = 'multipart/form-data'
        reqType = 'form';
      }      
    })

    for(let item in key){
      item = key[item];
      if(item === "req_query"){
        res[item] = handleReq_query.bind(this)(data.request[reflect[item]]);
      }else if(item === "req_body_form" && reqType === 'form' && data.request.postData){
        if(header === 'application/x-www-form-urlencoded'){
          res[item] = handleReq_body_form.bind(this)(data.request.postData[reflect[item]]);
        }else if(header === 'multipart/form-data' ){
          res[item] = [];
        }
        
      }else if(item === "req_headers"){
        res[item] = [{
          name: 'Content-Type',
          value: header
        }];
      }else if(item === "req_body_type"){
        res[item] = reqType;
      }else if(item === "path"){
        res[item] = handlePath.bind(this)(data.request[reflect[item]]);        
      }else if(item === "title"){
        let path = handlePath.bind(this)(data.request[reflect["path"]]);
        if(data.request[reflect[item]].indexOf(path) > -1){
          res[item] = path;
          if(res[item] && res[item].indexOf("/:") > -1){
            res[item] = res[item].substr(0,res[item].indexOf("/:"));
          }
        }else{
          res[item] = data.request[reflect[item]];
        }
      }else if(item === 'res_body_type'){
        res[item] = 'json';
      }else if(item === 'res_body'){
        res[item] = json_format(data.response.content.text);
      }      
      else{
        res[item] = data.request[reflect[item]];
      }
    }
    return res;
  }
  
  if(!importDataModule || typeof importDataModule !== 'object'){
    console.error('obj参数必需是一个对象');
    return null;
  }

  importDataModule.har = {
    name: 'HAR',
    run: run,
    desc: '使用chrome录制请求功能，具体使用请查看文档'
  }
}



module.exports = function(){


  this.bindHook('import_data', postman)
}