let price = [];
(function() {
  let month = parseInt(new Date().getMonth())+1
    fetch(`/admin/orderDataAdminDaily?month=${month}&year=${new Date().getFullYear()}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => res.json())
      .then((res) => {
        for(i=1;i<=30;i++){
          for(j=0;j<=30;j++){
            if(res[j]?._id == i){
              price[i] = res[j]?.totalCount
              break;
            }else{
              price[i] = 0
            }   
          } 
        }
       

var ctx1 = document.getElementById("chart-line-daily").getContext("2d");

const monthToreadable = (date)=>{
    let month = ['Jan','Feb','March','April','May','June','July','Aug','Sept','Nov','Dec']
    let mm = date.getMonth()-1;
    let monthText = month[mm]
    return(monthText)
}
  
    var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);
  
    gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
    gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');
    new Chart(ctx1, {
      type: "line",
      data: {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
        datasets: [{
          label:  "Sales "+monthToreadable(new Date()),
          tension: 0.4,
          borderWidth: 0,
          pointRadius: 0,
          borderColor: "#5e72e4",
          backgroundColor: gradientStroke1,
          borderWidth: 3,
          fill: true,
          data: [price[1],price[2],price[3],price[4],price[5],price[6],price[7],price[8],price[9],price[10],price[11],price[12],price[13],price[14],price[15],price[16],price[17],price[18]
          ,price[19],price[20],price[21],price[22],price[23],price[24],price[25],price[26],price[27],price[28],price[29],price[30]],
          maxBarThickness: 6
  
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              padding: 10,
              color: '#fbfbfb',
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              color: '#ccc',
              padding: 20,
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
        },
      },
    });
 
    var win = navigator.platform.indexOf('Win') > -1;
    if (win && document.querySelector('#sidenav-scrollbar')) {
      var options = {
        damping: '0.5'
      }
      Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
    }

})
}())