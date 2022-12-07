// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

(function (){
  // Chart.Legend.prototype.afterFit = function() {
  //   this.height = this.height + 50;
  // };
    fetch('/admin_panel/getPieData',{
      method:'get',
    }).then(res=>res.json())
    .then((res)=>{
      console.log(res);
      document.getElementById('pie-1').innerText=res[0]._id
      document.getElementById('pie-2').innerText=res[1]._id
      document.getElementById('pie-3').innerText=res[2]._id
// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: [ res[0]._id,res[1]._id,res[2]._id],
    datasets: [{
      data: [res[0].count,res[1].count,res[2].count],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
      hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: true,
      caretPadding: 10,
    },
    legend: {
      display: true,
      "maxSize" : {
        "height" : 200
    },
    },
    cutoutPercentage: 60,
  },
});

})
})()
