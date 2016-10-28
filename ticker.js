<html>
<body>

<div id="single_stock"></div>

<script type='text/javascript'>

// main

function main()
{
	new Ticker
	(
		[
			new Tick("NASDAQ", "GOOG"),
		]
	).initialize();
}

// class

function Tick(exchange, symbol, priceLast)
{
	this.exchange = exchange;
	this.symbol = symbol;
	this.priceLast = priceLast;
}
{
	Tick.prototype.domElementUpdate = function(parentDomElement)
	{
		if (this.domElement == null)
		{
			var tr = document.createElement("tr");

			var td = document.createElement("td");
			tr.appendChild(td);

			var td = document.createElement("td");			
			tr.appendChild(td);

			this.domElement = tr;

			parentDomElement.appendChild(this.domElement);
		}

		var tdsAll = this.domElement.getElementsByTagName("td");

		var priceAsString;

		if (this.priceLast == null)
		{
			priceAsString = "?";
		}
		else
		{
			var centsPerDollar = 100;
			var cents = Math.floor(this.priceLast * centsPerDollar) % centsPerDollar;
			var dollarsAsString = "" + Math.floor(this.priceLast);
			var centsAsString = (cents < 10 ? "0" : "") + cents;
			priceAsString = dollarsAsString + "." + centsAsString;
		}

		tdsAll[0].innerHTML = this.symbol;
		tdsAll[1].innerHTML = priceAsString;
	}

	Tick.prototype.update = function()
	{
		this.updateUsingWebServiceYahoo();
	}

	/*
	Tick.prototype.updateUsingWebServiceGoogle = function()
	{
	
		var requestURL = 
			"https://www.google.com/finance/info?q="
			+ this.exchange + ":" + this.symbol;

		var request = new XMLHttpRequest();
		request.open("GET", requestURL, false);
		try
		{
			request.send(null);
			var responseAsString = request.responseText;
			responseAsString = responseAsString.substr("////".length);

			var responseAsArray = JSON.parse(responseAsString);
			var responseAsObject = responseAsArray[0];
	
			this.priceLast = responseAsObject["l"]; // "latest"
		}
		catch(e)
		{
			this.priceLast = "?";
		}
	}
	*/

	Stock.prototype.updateUsingWebServiceYahoo = function()
	{
		var requestURL = 
			"https://finance.yahoo.com/webservice/v1/symbols/"
			+ this.symbol
			+ "/quote?format=json";

		var request = new XMLHttpRequest();
		request.open("GET", requestURL, false);
		try
		{
			request.send(null);
			var responseAsString = request.responseText;

			var responseAsArray = JSON.parse(responseAsString);
			var responseAsObject = responseAsArray.list.resources[0].resource;
	
			this.priceLast = parseFloat(responseAsObject.fields.price);

		}
		catch(e)
		{
			this.priceLast = "?";
		}
	}

}

function StockTracker(stocksToTrack)
{
	this.stocksToTrack = stocksToTrack;
}
{
	// constants
	StockTracker.Newline = "<br />";

	// instance methods

	StockTracker.prototype.initialize = function()
	{
		var millisecondsPerTimerTick = 2000;

		setInterval
		(
			this.handleEventTimerTick.bind(this),
			millisecondsPerTimerTick
		);

		this.handleEventTimerTick();
	}

	StockTracker.prototype.update = function()
	{
		for (var i = 0; i < this.stocksToTrack.length; i++)
		{
			var stock = this.stocksToTrack[i];
			stock.update();
		}

		this.domElementUpdate();
	}

	// dom

	StockTracker.prototype.domElementUpdate = function()
	{
		var divTracker = document.createElement("div");

		if (this.domElement == null)
		{
			var labelSymbolToAdd = document.createElement("label");
			labelSymbolToAdd.for = "inputSymbolToAdd";
			labelSymbolToAdd.innerHTML = "Add Stock by Symbol:";
			divTracker.appendChild(labelSymbolToAdd);

			var inputSymbolToAdd = document.createElement("input");
			inputSymbolToAdd.id = "inputSymbolToAdd";
			divTracker.appendChild(inputSymbolToAdd);

			var buttonSymbolAdd = document.createElement("button");
			buttonSymbolAdd.innerHTML = "Add";
			buttonSymbolAdd.onclick = this.buttonSymbolAdd_Click.bind(this);
			divTracker.appendChild(buttonSymbolAdd);

			var tableQuotes = document.createElement("table");
			tableQuotes.id = "tableQuotes";
			tableQuotes.border = "1px solid";

			var tr = document.createElement("tr");

			//var td = document.createElement("td");
			//td.innerHTML = "Exchange";
			//tr.appendChild(td);

			var td = document.createElement("td");
			td.innerHTML = "Symbol";
			tr.appendChild(td);

			var td = document.createElement("td");
			td.innerHTML = "Price";
			tr.appendChild(td);

			tableQuotes.appendChild(tr);

			for (var i = 0; i < this.stocksToTrack.length; i++)
			{
				var stock = this.stocksToTrack[i];
				stock.domElementUpdate(tableQuotes);
			}		

			divTracker.appendChild(tableQuotes);

			this.domElement = divTracker;
			var divMain = document.getElementById("divMain");
			divMain.appendChild(this.domElement);
		}

		var tableQuotes = document.getElementById("tableQuotes");

		for (var i = 0; i < this.stocksToTrack.length; i++)
		{
			var stock = this.stocksToTrack[i];
			stock.domElementUpdate(tableQuotes);
		}
	}

	// events

	StockTracker.prototype.buttonSymbolAdd_Click = function(e)
	{
		var inputSymbolToAdd = document.getElementById("inputSymbolToAdd");
		var stockToAddAsString = inputSymbolToAdd.value;

		var exchange;
		var symbol;

		if (stockToAddAsString.indexOf(":") == -1)
		{
			exchange = null;
			symbol = stockToAddAsString;
		}
		else
		{
			var stockToAddAsStrings = stockToAddAsString.split(":");
			exchange = stockToAddAsStrings[0] 
			symbol = stockToAddAsStrings[1];
		}
		
		var stock = new Stock
		(
			exchange, symbol
		);
		this.stocksToTrack.push(stock);

		this.update();
	}

	StockTracker.prototype.handleEventTimerTick = function()
	{
		this.update();	
	}
}

// run

main();

</script>
</body>
</html>
