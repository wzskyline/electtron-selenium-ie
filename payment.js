const {Builder, By, Key, until,Capabilities,Point,Options,Proxy} = require('selenium-webdriver');
 
 
var ie = require('selenium-webdriver/ie');
    

var payment={

    async login(){ 
        global['webContents'].send('replay',{    event:'login-bank-log',   data:{}    })

let driver =await new  Builder()
            .setIeOptions(new ie.Options().ignoreZoomSetting(true))
            .withCapabilities( Capabilities.ie( )  ) 
            .build();
            global['webContents'].send('replay',{    event:' after-driver-builder',   data:{}    })
            await driver.get('https://pbank.psbc.com/perbank/html/system/login.html');
         
            await driver.wait(until.titleIs('中国邮政储蓄银行个人网上银行'), 1000); 
            await driver.findElement({id:"logType"}).click();
            var username= "username"
            await  driver.executeScript("$('#logonId').val('"+ username +"').focus().click()" );
           
            await driver.sleep(100)  

     

    },
}
module.exports = payment;