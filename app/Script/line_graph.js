
    var mapped;
    var myArray=[];
    const baseurl = "";

  
   
window.onload = function () {
    $("#graphitem1").hide();

  $.ajax({
            type: "GET",
            ContentType: "application/x-www-form-urlencoded",
            url: baseurl+"/trucks",      
              
            success: function(data) {
              console.log(data);
               mapped = data; 
               
                                for(var i=0;i< mapped.length;i++)
                                {
                                 myArray.push( mapped[i]);
                                }
                                myArray.sort();
                                var options = '';
                                for(var i = 0; i < myArray.length; i++)
                                  options += '<option value="'+myArray[i]+'" />';
                                  var darta=document.getElementById('somethingelse').innerHTML = options;
                                  
                  },
            error:function(data){
            console.log(data);
            }         
        });
        
}



var reg_no;
function checkVehicle(id)
{
        reg_no = document.getElementById(id).value;
      if(myArray.indexOf(reg_no)==-1)
{
alert(" Entered Vehicle Does not Exist!..Please select vehicle from Dropdown");
       return;
}
else
{
  $("#graphitem1").show();   
  showGraph1(reg_no);
  showGraph2(reg_no);
  showGraph3(reg_no);
  showGraph4(reg_no);

}
}

 
   function showGraph1(reg_no)
  {

  $.ajax({
            type: "GET",
            ContentType: "application/x-www-form-urlencoded",
            //url:"http://localhost:8081/speedgraph/engineTemperature/"+reg_no,       
            url:baseurl+"/speedgraph/engineTemperature/"+reg_no, 
            success: function(data) {
              console.log(data);
             viewchart1(data);
                  },
            error:function(data){
              console.log(data);
        }

         
        });    
    }

   function showGraph2()
  { 
  $.ajax({
            type: "GET",
            ContentType: "application/x-www-form-urlencoded",
            //url:"http://localhost:8081/speedgraph/engineRPM/"+reg_no,
            url:baseurl+"/speedgraph/engineRPM/"+reg_no,       
            success: function(data) {
              console.log(data);
             viewchart2(data);
                  },
            error:function(data){
              console.log(data);
        }
 
        });    
    }

   function showGraph3()
  {
  $.ajax({
            type: "GET",
            ContentType: "application/x-www-form-urlencoded",
            //url:"http://localhost:8081/speedgraph/engineLoad/"+reg_no,      
            url:baseurl+"/speedgraph/engineLoad/"+reg_no,        
            success: function(data) {
              console.log(data);
             viewchart3(data);
                  },
            error:function(data){
              console.log(data);
        }

         
        });    
    }

   function showGraph4()
  {

  $.ajax({
            type: "GET",
            ContentType: "application/x-www-form-urlencoded",
            //url:"http://localhost:8081/speedgraph/coolantTemperature/"+reg_no,      
            url:baseurl+"/speedgraph/coolantTemperature/"+reg_no,      
            //data:  "device_imei="+device_imei+"&date="+defaultdate,     
            success: function(data) {
              console.log(data);
             viewchart4(data);
                  },
            error:function(data){
              console.log(data);
        }

         
        });    
    }
   
function viewchart1(grapfData) {
    var EngineTemp = [];
    var timeData = [];
    if (grapfData != null && grapfData.length > 0) {
        for (i = 0; i < grapfData.length; i++) {
            
            EngineTemp.push(grapfData[i].engineTemperature);
          var Timearr = grapfData[i].Timestamp.split("T");
          var removedpoint = Timearr[1].split(".");
            timeData.push(removedpoint[0]);
            var Fuel_graph = document.getElementById("lineGraph1");
         
            var Fuel_graph = new Chart(Fuel_graph, {

                type: 'line',
           
                data: {
                    labels: timeData,
                    datasets: [
                     {
                       label:'Engine_Temperature' ,
                       data: EngineTemp,
                       borderColor: "rgb(0,0,255)",
                        backgroundColor: "transparent",
                       borderWidth: 1,
                       responsive:false,
                   }]
                },
                options: {
                   animation: {
                      duration: 0, // general animation time
                  },
                  hover: {
                      animationDuration: 0, // duration of animations when hovering an item
                  },
                  responsiveAnimationDuration: 0, // animation duration after a resize
                  events: ['click'],
                    scales: {
                        xAxes: [{
                         stacked: true,
                            scaleLabel: {
                             display: true,
                               labelString: 'Time'
                           }
                        }],
                       yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Engine_Temperature'
                            },
                             stacked:true,
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
        
    }
                grapfData=null;

}

function viewchart2(grapfData) {
    var FuelData = [];
    var timeData = [];
    if (grapfData != null && grapfData.length > 0) {
        for (i = 0; i < grapfData.length; i++) {
            
            FuelData.push(grapfData[i].engineRPM);
          var Timearr = grapfData[i].Timestamp.split("T");
          var removedpoint = Timearr[1].split(".");
            timeData.push(removedpoint[0]);
            var Fuel_graph = document.getElementById("lineGraph2");
         
            var Fuel_graph = new Chart(Fuel_graph, {

                type: 'line',
           
                data: {
                    labels: timeData,
                    datasets: [
                     
                     {
                       label:'Engine RPM' ,
                       data: FuelData,
                       borderColor: "rgb(0,0,255)",
                        backgroundColor: "transparent",
                       borderWidth: 1,
                       responsive:false,
                   }]
                },
                options: {
                   animation: {
                      duration: 0, // general animation time
                  },
                  hover: {
                      animationDuration: 0, // duration of animations when hovering an item
                  },
                  responsiveAnimationDuration: 0, // animation duration after a resize
                  events: ['click'],
                    scales: {
                        xAxes: [{
                         stacked: true,
                            scaleLabel: {
                             display: true,
                               labelString: 'Time'
                           }
                        }],
                       yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Engine RPM'
                            },
                             stacked:true,
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
        
    }
                grapfData=null;

}
function viewchart3(grapfData) {
    var FuelData = [];
    var timeData = [];
    if (grapfData != null && grapfData.length > 0) {
        for (i = 0; i < grapfData.length; i++) {
            
            FuelData.push(grapfData[i].engineLoad);
          var Timearr = grapfData[i].Timestamp.split("T");
          var removedpoint = Timearr[1].split(".");
            timeData.push(removedpoint[0]);
            var Fuel_graph = document.getElementById("lineGraph3");
         
            var Fuel_graph = new Chart(Fuel_graph, {

                type: 'line',
           
                data: {
                    labels: timeData,
                    datasets: [
                     
                     {
                       label:'Engine Load' ,
                       data: FuelData,
                       borderColor: "rgb(0,0,255)",
                        backgroundColor: "transparent",
                       borderWidth: 1,
                       responsive:false,
                   }]
                },
                options: {
                   animation: {
                      duration: 0, // general animation time
                  },
                  hover: {
                      animationDuration: 0, // duration of animations when hovering an item
                  },
                  responsiveAnimationDuration: 0, // animation duration after a resize
                  events: ['click'],
                    scales: {
                        xAxes: [{
                         stacked: true,
                            scaleLabel: {
                             display: true,
                               labelString: 'Time'
                           }
                        }],
                       yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Engine Load'
                            },
                             stacked:true,
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
        
    }
                grapfData=null;

}
function viewchart4(grapfData) {
    var FuelData = [];
    var timeData = [];
    if (grapfData != null && grapfData.length > 0) {
        for (i = 0; i < grapfData.length; i++) {
            
            FuelData.push(grapfData[i].coolantTemperature);
          var Timearr = grapfData[i].Timestamp.split("T");
          var removedpoint = Timearr[1].split(".");
            timeData.push(removedpoint[0]);
            var Fuel_graph = document.getElementById("lineGraph4");
         
            var Fuel_graph = new Chart(Fuel_graph, {

                type: 'line',
           
                data: {
                    labels: timeData,
                    datasets: [
                     
                     {
                       label:'Coolant Temperature' ,
                       data: FuelData,
                       borderColor: "rgb(0,0,255)",
                        backgroundColor: "transparent",
                       borderWidth: 1,
                       responsive:false,
                   }]
                },
                options: {
                   animation: {
                      duration: 0, // general animation time
                  },
                  hover: {
                      animationDuration: 0, // duration of animations when hovering an item
                  },
                  responsiveAnimationDuration: 0, // animation duration after a resize
                  events: ['click'],
                    scales: {
                        xAxes: [{
                         stacked: true,
                            scaleLabel: {
                             display: true,
                               labelString: 'Time'
                           }
                        }],
                       yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Coolant Temperature'
                            },
                             stacked:true,
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
        
    }
                grapfData=null;

}

