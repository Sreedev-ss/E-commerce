(function() {
    fetch('/admin_panel/orderDataAdminYearly', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => res.json())
      .then((res) => {
        let price = res.arr3
        console.log(price);
        for(i=2017;i<price.length;i++){
          if(price[i]==undefined){
            price[i]=0
          }else{
            price[i]
          }
        }
  
  var ctx1 = document.getElementById("chart-yearly").getContext("2d");
    
      var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);
    
      gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
      gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
      gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: [2017,2018,2019,2020,2021,2022,2023],
          datasets: [{
            label: "Sales",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#5e72e4",
            backgroundColor: gradientStroke1,
            borderWidth: 3,
            fill: true,
            data: [price[2017],price[2018],price[2019],price[2020],price[2021],price[2022]],
            maxBarThickness: 6
    
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
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