<%@ Page Language="C#" Debug="true" %>
<html>
<head><title>Dynamic Page</title></head>
<body>
<h1>Dynamic Page</h1>
<%=DateTime.Now%>
<hr />
<%=new Random().NextDouble() %>
</body>
</html>