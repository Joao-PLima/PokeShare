function testChart(){
  const ctx = document.getElementById('chart1').getContext('2d');
  const chart1 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });



  const config = {
    type: 'line',
    data: data,
    options: {}
  };
}



var countCharts = 1
var charts = []

// buildDashboard({
//   data: [12, 19, 3, 5, 2, 3],
//   title: "Test title",
//   labels: [2018, 2019, 2020, 2021],
//   type: 'line'
// })
//
// buildDashboard({
//   data: [1000, 976, 800, 1100, 1045, 1056],
//   title: "Test title 2",
//   labels: [15, 16, 17, 18, 19, 20],
//   type: 'bar'
// })


/**
*
* title
* labels: array
* data: array
* backgroundColor: array | string
* border-width
*/

function buildDashboard(dashboardData){
  const data = {
      labels: [...dashboardData.labels],
      datasets: [{
          label: dashboardData.title,
          data: [...dashboardData.data],
          backgroundColor: dashboardData?.backgroundColor ?? 'rgba(255, 99, 132, 0.2)',
          borderColor: dashboardData?.borderColor ?? 'rgba(255, 99, 132, 1)',
          borderWidth: 1
      }]
  }

  const config = {
      type: dashboardData.type,
      data: data,
      options: {}
  };

  var nextChartId = charts?.[charts.length-1]?.id ?? 0
  nextChartId++
  console.log(nextChartId);

  var style = dashboardData.style ?? "width: 500px; height: 400px; float: left; margin: 30px; margin-bottom: 0px; margin-top: 0px;"
  $("#dashboardContainer").append("<div style=\""+style+"\"><canvas id=\"chart"+nextChartId+"\"></canvas></div>")

  console.log("#chart"+nextChartId);
  //const ctx = $("#chart"+nextChartId)
  const ctx = document.getElementById("chart"+nextChartId).getContext("2d")
  var chart = {
    chart: new Chart(ctx, config),
    id: nextChartId
  }
  charts.push(chart)

  console.log(charts);

}






var posts = []
var userId = -1;
var isAdmin = false;

function handlePosts(tempPosts, tempUserId, tempIsAdmin){
  userId = tempUserId
  isAdmin = tempIsAdmin
  //console.log("BBBBB")
  //console.log(tempPosts)
  posts = tempPosts
  rebuildCharts()
}

//console.log($.datepicker().parseDate("YYYY/MM/DD H:m:s", "2002/02/03 7:06:42"));


function rebuildCharts(){
  //console.log("C")
  //Likes per day of week
  for(i in posts){
    //console.log(posts[i]);
  }

  //Likes for last 5 posts
  console.log(posts);
  var postsMine = posts.filter(x => x.userid === userId)
  var last5 = postsMine.slice(-5).map(x => x.likes)
  console.log(last5);
  buildDashboard({
    data: [...last5],
    title: "Likes for last 5 of my posts - Average: "+Math.round(last5.reduce((a,b) => a+b)/5 * 100)/100,
    labels: [...last5],
    type: 'line'
  })

  var lastAll = postsMine.map(x => x.likes)
  buildDashboard({
    data: [...lastAll],
    title: "Likes for all my posts - Average: "+Math.round(lastAll.reduce((a,b) => a+b)/lastAll.length * 100)/100,
    labels: [...lastAll],
    type: 'line'
  })

  if(isAdmin){
    $("#dashboardContainer").append("<div style=\"float: clear; width: 100%;\"></div>")

    last5 = posts.slice(-5).map(x => x.likes)
    buildDashboard({
      data: [...last5],
      title: "Likes for last 5 global posts - Average: "+Math.round(last5.reduce((a,b) => a+b)/5 * 100)/100,
      labels: [...last5],
      type: 'line',
      backgroundColor: 'rgba(12, 99, 13, 0.2)',
      borderColor: 'rgba(12, 99, 13, 1)'
    })

    lastAll = posts.map(x => x.likes)
    buildDashboard({
      data: [...lastAll],
      title: "Likes for all global posts - Average: "+Math.round(lastAll.reduce((a,b) => a+b)/lastAll.length * 100)/100,
      labels: [...lastAll],
      type: 'line',
      backgroundColor: 'rgba(12, 99, 13, 0.2)',
      borderColor: 'rgba(12, 99, 13, 1)'
    })

  }

  // buildDashboard({
  //   data: [2, 3, 5],
  //   title: "Pizza test",
  //   labels: ["Calabresa", "Peproni", "Queijo"],
  //   type: 'pie',
  //   backgroundColor: [
  //     'rgba(255, 99, 132, 0.2)',
  //     'rgba(54, 162, 235, 0.2)',
  //     'rgba(255, 206, 86, 0.2)'
  //   ],
  //   borderColor: [
  //     'rgba(255, 99, 132, 1)',
  //     'rgba(54, 162, 235, 1)',
  //     'rgba(255, 206, 86, 1)',
  //   ],
  //   style: "margin-bottom: 100px;"
  // })

}











//aa
