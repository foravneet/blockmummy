
// *************************************
// popper
// *************************************
function doPopper()    
{    
var reference = document.querySelector('#rotatingGlobe');
   
var popper = document.querySelector('#avnblockscroll');

var blockpopper = document.querySelector('#avnscroll');    
  
var txPopper = new Popper(
    popper,
    reference,
    {
        placement:'bottom'
    }
);

var txblockPopper = new Popper(
    reference,
    blockpopper,
    {
        placement:'right'
    }
);
}

// *************************************
// syntax highlight
// *************************************
//sendMsg
function sendMsg() {
    var message = document.getElementById("myMessage").value;
    ws.send(message);
}

//closeConn
function closeConn() {
    ws.close();
}

//prettyJSON
function prettyJSON(mytext) {
    
    if (!library)
      var library = {};

    library.json = {
      replacer: function(match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class=json-key>';
        var val = '<span class=json-value>';
        var str = '<span class=json-string>';
        var r = pIndent || '';
        if (pKey)
          r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal)
          r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
      },
      prettyPrint: function(obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        return JSON.stringify(obj, null, 3)
          .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(jsonLine, library.json.replacer);
      }
    };
    $('#txDetails').html(library.json.prettyPrint(mytext));
}
    
// Displays the block by rendering a div summarizing some of its most important details
function showBlock(b) {
console.log(b);   
  var total = b.total / 100000000
 // $('#blockDetails').before("<div>Block at "+b.height+" transferred "+ total+" in "+b.n_tx+" transactions.</div>");
 
    var m = new Date(b.received_time);
    var displayDate =
        m.getFullYear() + "/" +
        ("0" + (m.getMonth()+1)).slice(-2) + "/" +
        ("0" + m.getDate()).slice(-2) + " " +
        ("0" + m.getHours()).slice(-2) + ":" +
        ("0" + m.getMinutes()).slice(-2) + ":" +
        ("0" + m.getSeconds()).slice(-2);
    
    $("#avnblocklist").prepend("<li class='news-item'><table style='font-family:Courier New, Courier, monospace; font-size:90%' cellpadding='4'><tr> <td><img src='img/bitcoin.png' width='60' class='img-circle'/></td><td>"+'Block Height' + "&nbsp;&nbsp;-&nbsp;&nbsp;"+b.height + "&nbsp;&nbsp; Depth - "+b.depth 
                               + "<br/>Received:"+displayDate
                               + "<br/>#Transactions:"+b.n_tx
                               + "<br/>Hash:"+b.hash.substring(0, 28) + "..."
                               + "<br/>Merkle Root:"+b.mrkl_root.substring(0, 28) + "..."
                               +"<br/>#Total:<i class='fa fa-btc'></i>" + total + "</td></tr></table></li>");   
    
 //prettyJSON(b);
}

// Gets the JSON data returned by the previous JQuery.get, parse it and returns a
// new promise to get the next block.
function printAndGetNext(block) {
  showBlock(block);
  return $.get(block.prev_block_url);
}

//getUnConfirmedTx        
function getUnConfirmedTx() {
   
        if (ws !== undefined) {
            ws.close()
        }
        var count = 0;
        ws = new WebSocket("wss://socket.blockcypher.com/v1/btc/main");    
    ws.onmessage = function (event) {
            //console.log("** onmessage: " + event.data);
          var tx = JSON.parse(event.data);
          displayUnTxData(tx,count);
        
          count++;
          if (count >= 20 ) ws.close();
        }
        ws.onopen = function(event) {
            console.log("*** onopen.");
          ws.send(JSON.stringify({event: "unconfirmed-tx"}));
        }

        ws.onclose = function(evt) {
            console.log("*** onclose.");
        };
        ws.onerror = function(evt) {
            console.log("*** Error!");
        };
}

function prepareTxForDisplay(tx)
{
    //delete the elements we dont need to show 
    delete tx.addresses;
    delete tx.double_spend;
    delete tx.preference;
    delete tx.vin_sz;
    delete tx.vout_sz;
    delete tx.confirmations;
    tx.hash = tx.hash.substring(0, 18) + "...";
    //loop inputs
    for (var i = 0 ; i < tx.inputs.length ; i++) {
        tx.inputs[i].prev_hash = tx.inputs[i].prev_hash.substring(0, 18) + "...";
        if(tx.inputs[i].hasOwnProperty('script'))
            tx.inputs[i].script = tx.inputs[i].script.substring(0, 18) + "...";
        delete tx.inputs[i].addresses;
        delete tx.inputs[i].output_value;
        delete tx.inputs[i].sequence;
        delete tx.inputs[i].age;
        if(tx.inputs[i].hasOwnProperty('witness'))
            {
               for (var j = 0 ; j < tx.inputs[i].witness.length ; j++) 
                   {
                       if(tx.inputs[i].witness[j].length > 18)
                            tx.inputs[i].witness[j] = tx.inputs[i].witness[j].substring(0, 18) + "...";
                   }
            }
    }
    //loop outputs
    for (var i = 0 ; i < tx.outputs.length ; i++) {
        tx.outputs[i].script = tx.outputs[i].script.substring(0, 18) + "...";
        delete tx.outputs[i].addresses;
        if(tx.outputs[i].hasOwnProperty('data_hex'))
        {
            tx.outputs[i].data_hex = tx.outputs[i].data_hex.substring(0, 18) + "...";
        }
    }
}

// displayUnTxData
function displayUnTxData(tx,count)
{
    if(tx==null) return;
    var relayed_by = tx.relayed_by.split(':')[0];
    //console.log(relayed_by);
    
    //set this tx in global map
   // unTxMap.set(relayed_by,tx);
    
    $.get("https://api.ipdata.co/"+relayed_by, function (response) {
    //var innertx =  unTxMap.get(response.ip);
    //console.log("From Map" + JSON.stringify(tx));    
    var lati = response.latitude;
    var longi = response.longitude;  

    prepareTxForDisplay(tx);
    prettyJSON(tx);  
        
    var m = new Date(tx.received);
    var displayDate =
        m.getFullYear() + "/" +
        ("0" + (m.getMonth()+1)).slice(-2) + "/" +
        ("0" + m.getDate()).slice(-2) + " " +
        ("0" + m.getHours()).slice(-2) + ":" +
        ("0" + m.getMinutes()).slice(-2) + ":" +
        ("0" + m.getSeconds()).slice(-2);
        
   $("#avnlist").prepend("<li class='news-item'><table style='font-family:Courier New, Courier, monospace; font-size:80%' cellpadding='4'><tr> <td><img src='"+response.flag+"' width='40' class='img-circle'/></td><td>"+(count+1) + ".&nbsp;"+response.country_name + "-"+displayDate + "<br/>Hash:"+tx.hash+"<br/>Amount:<i class='fa fa-btc'></i>" + tx.total/100000000 + "<br/>"+ "Inputs:" + tx.inputs.length +" {"+tx.inputs[0].script_type+ "..}<br/>Outputs:" + tx.outputs.length +" {"+tx.outputs[0].script_type+ "..}</td></tr></table></li>");   
      
    //add ping    
    var color = colors[Math.floor(Math.random() * colors.length)];    
    //globe.plugins.pings.add(response.longitude, response.latitude, { color: color, ttl: 2000, angle: Math.random() * 10 }); 
    //add image
    globe.plugins.objects.add(response.longitude, response.latitude, { imagesrc:"img/bitcoin.png" });    
        
    }, "jsonp");
}