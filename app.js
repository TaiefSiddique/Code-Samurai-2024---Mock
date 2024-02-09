const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User, Station, Train, Ticket } = require('./models');
//const Book = require("./models");


const dbUrl = `mongodb+srv://basic-crud-revise:xOU9eXJ04o6ARABT@cluster0.nebbavw.mongodb.net/?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to database!");
    flushDatabase();

    // Define mongoose schemas and models based on the provided data models





    // API routes

    // Add user
    app.post('/api/users', async (req, res) => {
      try {
        const newUser = await User.create(req.body);
        res.status(201).json(req.body);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Add station
    app.post('/api/stations', async (req, res) => {
      try {
        const newStation = await Station.create(req.body);
        res.status(200).json(req.body);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    // List all stations
    app.get('/api/stations', async (req, res) => {
      try {
        const stations = await Station.find({}, { _id: 0, __v: 0 },).sort({ station_id: 1 });

        res.status(200).json({ stations });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // Add train
    // app.post('/api/trains', async (req, res) => {
    //   try {
    //     const newTrain = await Train.create(req.body);
    //     res.status(201).json(req.body);
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    app.post('/api/trains', async (req, res) => {
      try {
        const { train_id, train_name, capacity, stops } = req.body;

        // Calculate service_start, service_ends, and num_stations
        const service_start = stops[0].departure_time;
        const service_ends = stops[stops.length - 1].arrival_time;
        const num_stations = stops.length;

        const newTrain = await Train.create({
          train_id,
          train_name,
          capacity,
          stops,
          service_start,
          service_ends,
          num_stations,
        });

        res.status(201).json({
          train_id: newTrain.train_id,
          train_name: newTrain.train_name,
          capacity: newTrain.capacity,
          service_start: newTrain.service_start,
          service_ends: newTrain.service_ends,
          num_stations: newTrain.num_stations,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // List all stations
    // app.get('/api/stations', async (req, res) => {
    //   try {
    //     const stations = await Station.find().sort({ station_id: 1 });
    //     res.status(200).json({ stations });
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });

    // List all trains for a station
    app.get('/api/stations/:station_id/trains', async (req, res) => {
      try {
        const stationId = parseInt(req.params.station_id);

        // Check if the station exists
        const station = await Station.findOne({ station_id: stationId });
        if (!station) {
          return res.status(404).json({
            message: `Station with id ${stationId} was not found`,
          });
        }

        // Find trains with a stop at the given station
        const trains = await Train.find({
          'stops.station_id': stationId,
        });

        // Format and sort the trains array
        const formattedTrains = trains.map((train) => {
          const stop = train.stops.find((s) => s.station_id === stationId);
          return {
            train_id: train.train_id,
            arrival_time: stop.arrival_time || null,
            departure_time: stop.departure_time,
          };
        });

        // Sort trains by departure time, arrival time, and train_id
        formattedTrains.sort((a, b) => {
          if (a.departure_time === b.departure_time) {
            if (a.arrival_time === b.arrival_time) {
              return a.train_id - b.train_id;
            }
            if (!a.arrival_time) return -1;
            if (!b.arrival_time) return 1;
            return a.arrival_time.localeCompare(b.arrival_time);
          }
          if (!a.departure_time) return -1;
          if (!b.departure_time) return 1;
          return a.departure_time.localeCompare(b.departure_time);
        });

        // Send the response
        res.status(200).json({
          station_id: stationId,
          trains: formattedTrains,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // app.get('/api/stations/:station_id/trains', async (req, res) => {
    //   const { station_id } = req.params;
    //   try {
    //     const station = await Station.findById(station_id);
    //     if (!station) {
    //       return res.status(404).json({ message: `Station with id: ${station_id} was not found` });
    //     }

    //     const trains = await Train.find({ 'stops.station_id': station_id });

    //     const formattedTrains = trains.map((train) => {
    //       const stop = train.stops.find((stop) => stop.station_id === station_id);
    //       return {
    //         train_id: train.train_id,
    //         arrival_time: stop.arrival_time || null,
    //         departure_time: stop.departure_time || null,
    //       };
    //     });

    //     formattedTrains.sort((a, b) => {
    //       if (a.departure_time === b.departure_time) {
    //         if (a.arrival_time === b.arrival_time) {
    //           return a.train_id - b.train_id;
    //         }
    //         return a.arrival_time - b.arrival_time;
    //       }
    //       return a.departure_time - b.departure_time;
    //     });

    //     res.status(200).json({ station_id: parseInt(station_id), trains: formattedTrains });
    //   } catch (error) {
    //     //console.error(error); // Log the actual error for debugging
    //     // res.status(500).json({ error: 'Internal Server Error' });
    //     res.status(404).json({ message: `Station with id: ${station_id} was not found` });
    //   }
    // });

    app.get('/api/wallets/:wallet_id', async (req, res) => {
      try {
        const { wallet_id } = req.params;
        const user = await User.findOne({ user_id: wallet_id });
        if (!user) {
          return res.status(404).json({ message: `wallet with id: ${wallet_id} was not found` });
        }
        return res.status(200).json({
          wallet_id: user.user_id,
          wallet_balance: user.balance,
          wallet_user: {
            user_id: user.user_id,
            user_name: user.user_name,
          }
        });
      } catch (error) {
        console.error('Error in getting wallet balance:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });


    app.put('/api/wallets/:wallet_id', async (req, res) => {
      try {
        const { wallet_id } = req.params;
        const { recharge } = req.body;

        if (recharge < 100 || recharge > 10000) {
          return res.status(400).json({ message: `invalid amount: ${recharge}` });
        }

        const user = await User.findOne({ user_id: wallet_id });
        if (!user) {
          return res.status(404).json({ message: `wallet with id: ${wallet_id} was not found` });
        }

        user.balance += recharge;
        await user.save();

        return res.status(200).json({
          wallet_id: user.user_id,
          wallet_balance: user.balance,
          wallet_user: {
            user_id: user.user_id,
            user_name: user.user_name
          }
        });
      } catch (error) {
        console.error('Error in adding wallet balance:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });




    //ticketing
    // app.post('/api/tickets', async (req, res) => {
    //   try {
    //     const { wallet_id, time_after, station_from, station_to } = req.body;

    //     // Check if stations exist
    //     const startStation = await Station.findOne({ station_id: station_from });
    //     const endStation = await Station.findOne({ station_id: station_to });

    //     if (!startStation || !endStation) {
    //       return res.status(404).json({ message: 'One or more stations not found' });
    //     }

    //     // Fetch user's balance
    //     const user = await User.findOne({ user_id: wallet_id });
    //     if (!user) {
    //       return res.status(404).json({ message: `Wallet with id: ${wallet_id} was not found` });
    //     }

    //     // Calculate ticket fare
    //     let totalFare = 0;
    //     let currentStation = station_from;
    //     while (currentStation !== station_to) {
    //       const train = await Train.findOne({
    //         'stops.station_id': currentStation,
    //         'stops.station_id': station_to,
    //       });

    //       if (!train) {
    //         return res.status(403).json({
    //           message: `No ticket available for station: ${station_from} to station: ${station_to}`,
    //         });
    //       }

    //       const currentStop = train.stops.find(stop => stop.station_id === currentStation);
    //       totalFare += currentStop.fare;
    //       currentStation = train.stops[train.stops.findIndex(stop => stop.station_id === currentStation) + 1].station_id;
    //     }

    //     // Check if user has enough balance
    //     if (user.balance < totalFare) {
    //       return res.status(402).json({ message: `Recharge amount: ${totalFare - user.balance} to purchase the ticket` });
    //     }

    //     // Deduct fare from user's balance
    //     user.balance -= totalFare;
    //     await user.save();

    //     // Generate ticket
    //     const ticket = {
    //       ticket_id: Math.floor(Math.random() * 1000), // Generate unique ticket ID
    //       wallet_id: user.user_id,
    //       balance: user.balance,
    //       stations: [], // To be populated with station details
    //     };

    //     // Logic to populate ticket with station details goes here...
    //     // Find trains connecting the starting and destination stations
    //     const trains = await Train.find({
    //       'stops.station_id': { $in: [station_from, station_to] }
    //     });

    //     // Sort trains by departure time from starting station
    //     trains.sort((a, b) => {
    //       const departureA = a.stops.find(stop => stop.station_id === station_from).departure_time;
    //       const departureB = b.stops.find(stop => stop.station_id === station_from).departure_time;
    //       return new Date(departureA) - new Date(departureB);
    //     });

    //     // Initialize variables
    //     currentStation = station_from;
    //     let remainingStations = trains.map(train => train.stops.find(stop => stop.station_id === currentStation));

    //     // Add the starting station to the ticket
    //     ticket.stations.push({
    //       station_id: currentStation,
    //       train_id: remainingStations[0].train_id,
    //       arrival_time: null,
    //       departure_time: remainingStations[0].departure_time
    //     });

    //     // Iterate through the trains and add the intermediate stations to the ticket
    //     for (const stop of remainingStations) {
    //       if (stop.station_id === station_to) {
    //         // Reached destination station, exit loop
    //         break;
    //       }

    //       // Find the next station
    //       const nextStopIndex = remainingStations.findIndex(s => s.station_id !== currentStation);
    //       const nextStop = remainingStations[nextStopIndex];

    //       // Add the next station to the ticket
    //       ticket.stations.push({
    //         station_id: nextStop.station_id,
    //         train_id: nextStop.train_id,
    //         arrival_time: stop.arrival_time,
    //         departure_time: nextStop.departure_time
    //       });

    //       // Update current station
    //       currentStation = nextStop.station_id;
    //     }

    //     // Add the destination station to the ticket
    //     ticket.stations.push({
    //       station_id: station_to,
    //       train_id: remainingStations[remainingStations.length - 1].train_id,
    //       arrival_time: remainingStations[remainingStations.length - 1].arrival_time,
    //       departure_time: null
    //     });
    //     // Respond with success and ticket details
    //     return res.status(201).json(ticket);
    //   } catch (error) {
    //     console.error('Error in purchasing ticket:', error);
    //     res.status(500).json({ message: 'Internal Server Error' });
    //   }
    // });
    //second attempt
    // app.post('/api/tickets', async (req, res) => {
    //   try {
    //     const { wallet_id, time_after, station_from, station_to } = req.body;

    //     // Check if stations exist
    //     const startStation = await Station.findOne({ station_id: station_from });
    //     const endStation = await Station.findOne({ station_id: station_to });

    //     if (!startStation || !endStation) {
    //       return res.status(404).json({ message: 'One or more stations not found' });
    //     }

    //     // Fetch user's balance
    //     const user = await User.findOne({ user_id: wallet_id });
    //     if (!user) {
    //       return res.status(404).json({ message: `Wallet with id: ${wallet_id} was not found` });
    //     }

    //     // Calculate ticket fare
    //     let totalFare = 0;
    //     let currentStation = station_from;

    //     while (currentStation !== station_to) {
    //       const train = await Train.findOne({
    //         'stops.station_id': currentStation,
    //         'stops.station_id': station_to,
    //       });

    //       if (!train) {
    //         return res.status(403).json({
    //           message: `No ticket available for station: ${station_from} to station: ${station_to}`,
    //         });
    //       }

    //       const currentStop = train.stops.find(stop => stop.station_id === currentStation);
    //       totalFare += currentStop.fare;
    //       currentStation = train.stops[train.stops.findIndex(stop => stop.station_id === currentStation) + 1].station_id;
    //     }

    //     // Check if user has enough balance
    //     if (user.balance < totalFare) {
    //       return res.status(402).json({ message: `Recharge amount: ${totalFare - user.balance} to purchase the ticket` });
    //     }

    //     // Deduct fare from user's balance
    //     user.balance -= totalFare;
    //     await user.save();

    //     // Generate ticket
    //     const ticket = await generateTicket(station_from, station_to);

    //     // Respond with success and ticket details
    //     return res.status(201).json(ticket);
    //   } catch (error) {
    //     console.error('Error in purchasing ticket:', error);
    //     res.status(500).json({ message: 'Internal Server Error' });
    //   }
    // });

    // async function generateTicket(station_from, station_to) {
    //   const ticket = {
    //     ticket_id: Math.floor(Math.random() * 1000), // Generate unique ticket ID
    //     wallet_id: user.user_id,
    //     balance: user.balance,
    //     stations: [], // To be populated with station details
    //   };

    //   // Logic to populate ticket with station details goes here...
    //   // Find trains connecting the starting and destination stations
    //   const trains = await Train.find({
    //     'stops.station_id': { $in: [station_from, station_to] }
    //   });

    //   // Sort trains by departure time from starting station
    //   trains.sort((a, b) => {
    //     const departureA = a.stops.find(stop => stop.station_id === station_from).departure_time;
    //     const departureB = b.stops.find(stop => stop.station_id === station_from).departure_time;
    //     return new Date(departureA) - new Date(departureB);
    //   });

    //   // Initialize variables
    //   let currentStation = station_from;
    //   let remainingStations = trains.map(train => train.stops.find(stop => stop.station_id === currentStation));

    //   // Add the starting station to the ticket
    //   ticket.stations.push({
    //     station_id: currentStation,
    //     train_id: remainingStations[0].train_id,
    //     arrival_time: null,
    //     departure_time: remainingStations[0].departure_time
    //   });

    //   // Iterate through the trains and add the intermediate stations to the ticket
    //   for (const stop of remainingStations) {
    //     if (stop.station_id === station_to) {
    //       // Reached destination station, exit loop
    //       break;
    //     }

    //     // Find the next station
    //     const nextStopIndex = remainingStations.findIndex(s => s.station_id !== currentStation);
    //     const nextStop = remainingStations[nextStopIndex];

    //     // Add the next station to the ticket
    //     ticket.stations.push({
    //       station_id: nextStop.station_id,
    //       train_id: nextStop.train_id,
    //       arrival_time: stop.arrival_time,
    //       departure_time: nextStop.departure_time
    //     });

    //     // Update current station
    //     currentStation = nextStop.station_id;
    //   }

    //   // Add the destination station to the ticket
    //   ticket.stations.push({
    //     station_id: station_to,
    //     train_id: remainingStations[remainingStations.length - 1].train_id,
    //     arrival_time: remainingStations[remainingStations.length - 1].arrival_time,
    //     departure_time: null
    //   });

    //   return ticket;
    // }
    //above api is still faulty let's try last one
    //copilot
    // app.post('/api/tickets', async (req, res) => {
    //   const { wallet_id, time_after, station_from, station_to } = req.body;

    //   async function calculateOptimalRouteAndCost(station_from, station_to, time_after) {
    //     // Placeholder for the actual implementation
    //     const trains = await Train.find();

    //     // Create a graph
    //     let graph = {};
    //     for (let train of trains) {
    //       for (let i = 0; i < train.stops.length - 1; i++) {
    //         let stop1 = train.stops[i];
    //         let stop2 = train.stops[i + 1];
    //         if (!graph[stop1.station_id]) {
    //           graph[stop1.station_id] = {};
    //         }
    //         graph[stop1.station_id][stop2.station_id] = stop2.fare;
    //       }
    //     }

    //     // Find the shortest path and calculate the total cost
    //     let { path, cost } = findShortestPath(graph, station_from, station_to);

    //     return { route: path, total_cost: cost };
    //   }
    //   function findShortestPath(graph, startNode, endNode) {
    //     let costs = {};
    //     let parents = {};
    //     let processed = [];

    //     // Initialize costs and parents
    //     for (let node in graph) {
    //       if (node === startNode) {
    //         costs[node] = 0;
    //       } else {
    //         costs[node] = Infinity;
    //       }
    //       parents[node] = null;
    //     }

    //     let node = findLowestCostNode(costs, processed);

    //     while (node) {
    //       let cost = costs[node];
    //       let neighbors = graph[node];
    //       for (let n in neighbors) {
    //         let newCost = cost + neighbors[n];
    //         if (!costs[n] || costs[n] > newCost) {
    //           costs[n] = newCost;
    //           parents[n] = node;
    //         }
    //       }
    //       processed.push(node);
    //       node = findLowestCostNode(costs, processed);
    //     }

    //     // Extract shortest path
    //     let shortestPath = [endNode];
    //     let parent = parents[endNode];
    //     while (parent) {
    //       shortestPath.unshift(parent);
    //       parent = parents[parent];
    //     }

    //     return {
    //       path: shortestPath,
    //       cost: costs[endNode]
    //     };
    //   }

    //   function findLowestCostNode(costs, processed) {
    //     let lowestCost = Infinity;
    //     let lowestCostNode = null;

    //     for (let node in costs) {
    //       let cost = costs[node];
    //       if (cost < lowestCost && !processed.includes(node)) {
    //         lowestCost = cost;
    //         lowestCostNode = node;
    //       }
    //     }

    //     return lowestCostNode;
    //   }
    //   let ticketCounter = 0;
    //   async function generateTicket(wallet_id, route) {
    //     // Placeholder for the actual implementation
    //     const ticket = new Ticket({
    //       ticket_id: ticketCounter++,
    //       wallet_id,
    //       route,
    //     });

    //     await ticket.save();

    //     return ticket.ticket_id;
    //   }


    //   // Fetch wallet details
    //   const wallet = await User.findOne({ user_id: wallet_id });

    //   // Calculate optimal route and total cost
    //   const { route, total_cost } = await calculateOptimalRouteAndCost(station_from, station_to, time_after);

    //   if (!route) {
    //     return res.status(403).json({ message: `no ticket available for station: ${station_from} to station: ${station_to}` });
    //   }

    //   if (wallet.balance < total_cost) {
    //     return res.status(402).json({ message: `recharge amount: ${total_cost - wallet.balance} to purchase the ticket` });
    //   }

    //   // Deduct cost from wallet and generate ticket
    //   wallet.balance -= total_cost;
    //   await wallet.save();
    //   const ticket_id = await generateTicket(wallet_id, route);

    //   res.status(201).json({
    //     ticket_id,
    //     wallet_id,
    //     balance: wallet.balance,
    //     stations: route
    //   });
    // });
    //copilot code ends
    app.post('/api/tickets', async (req, res) => {
      try {
        const { wallet_id, time_after, station_from, station_to } = req.body;

        // Check if stations exist
        const startStation = await Station.findOne({ station_id: station_from });
        const endStation = await Station.findOne({ station_id: station_to });

        if (!startStation || !endStation) {
          return res.status(404).json({ message: 'One or more stations not found' });
        }

        // Fetch user's balance
        const user = await User.findOne({ user_id: wallet_id });
        if (!user) {
          return res.status(404).json({ message: `Wallet with id: ${wallet_id} was not found` });
        }

        // Calculate ticket fare
        let totalFare = 0;
        let currentStation = station_from;

        while (currentStation !== station_to) {
          const train = await Train.findOne({
            'stops.station_id': currentStation,
            'stops.station_id': station_to,
          });

          if (!train) {
            return res.status(403).json({
              message: `No ticket available for station: ${station_from} to station: ${station_to}`,
            });
          }

          const currentStop = train.stops.find(stop => stop.station_id === currentStation);
          totalFare += currentStop.fare;
          currentStation = train.stops[train.stops.findIndex(stop => stop.station_id === currentStation) + 1].station_id;
        }

        // Check if user has enough balance
        if (user.balance < totalFare) {
          return res.status(402).json({ message: `Recharge amount: ${totalFare - user.balance} to purchase the ticket` });
        }

        // Deduct fare from user's balance
        user.balance -= totalFare;
        await user.save();

        // Generate ticket
        const ticket = await generateTicket(station_from, station_to);

        // Respond with success and ticket details
        return res.status(201).json(ticket);
      } catch (error) {
        console.error('Error in purchasing ticket:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    async function generateTicket(station_from, station_to) {
      const ticket = {
        ticket_id: Math.floor(Math.random() * 1000), // Generate unique ticket ID
        wallet_id: user.user_id,
        balance: user.balance,
        stations: [], // To be populated with station details
      };

      // Logic to populate ticket with station details goes here...
      // Find trains connecting the starting and destination stations
      const trains = await Train.find({
        'stops.station_id': { $in: [station_from, station_to] }
      });

      // Sort trains by departure time from starting station
      trains.sort((a, b) => {
        const departureA = a.stops.find(stop => stop.station_id === station_from).departure_time;
        const departureB = b.stops.find(stop => stop.station_id === station_from).departure_time;
        return new Date(departureA) - new Date(departureB);
      });

      // Initialize variables
      let currentStation = station_from;
      let remainingStations = trains.map(train => train.stops.find(stop => stop.station_id === currentStation));

      // Add the starting station to the ticket
      ticket.stations.push({
        station_id: currentStation,
        train_id: remainingStations[0].train_id,
        arrival_time: null,
        departure_time: remainingStations[0].departure_time
      });

      // Iterate through the trains and add the intermediate stations to the ticket
      for (const stop of remainingStations) {
        if (stop.station_id === station_to) {
          // Reached destination station, exit loop
          break;
        }

        // Find the next station
        const nextStopIndex = remainingStations.findIndex(s => s.station_id !== currentStation);
        const nextStop = remainingStations[nextStopIndex];

        // Add the next station to the ticket
        ticket.stations.push({
          station_id: nextStop.station_id,
          train_id: nextStop.train_id,
          arrival_time: stop.arrival_time,
          departure_time: nextStop.departure_time
        });

        // Update current station
        currentStation = nextStop.station_id;
      }

      // Add the destination station to the ticket
      ticket.stations.push({
        station_id: station_to,
        train_id: remainingStations[remainingStations.length - 1].train_id,
        arrival_time: remainingStations[remainingStations.length - 1].arrival_time,
        departure_time: null
      });

      return ticket;
    }

    // app.listen(3000, () => console.log('Server started on port 3000'));



    // app.get('/api/stations/:station_id/trains', async (req, res) => {
    //   const { station_id } = req.params;
    //   try {
    //     const station = await Station.findById(station_id);
    //     if (!station) {
    //       return res.status(404).json({ message: `Station with id: ${station_id} was not found` });
    //     }

    //     const trains = await Train.find({ 'stops.station_id': station_id }).sort({
    //       'stops.departure_time': 1,
    //       'stops.arrival_time': 1,
    //       train_id: 1,
    //     });

    //     const formattedTrains = trains.map((train) => {
    //       const stop = train.stops.find((stop) => stop.station_id === station_id);
    //       return {
    //         train_id: train.train_id,
    //         arrival_time: stop.arrival_time,
    //         departure_time: stop.departure_time,
    //       };
    //     });

    //     res.status(200).json({ station_id: parseInt(station_id), trains: formattedTrains });
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    // app.post('/api/books', async (req, res) => {
    //   try {
    //     const book = new Book(req.body);
    //     await book.save();
    //     res.status(201).json(book);
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    // app.put('/api/books/:id', async (req, res) => {
    //   try {
    //     const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    //     if (!book) {
    //       return res.status(404).json({ message: `Book with id: ${req.params.id} was not found` });
    //     }
    //     res.json(book);
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    // app.get('/api/books/:id', async (req, res) => {
    //   try {
    //     const book = await Book.findById(req.params.id);
    //     if (!book) {
    //       return res.status(404).json({ message: `Book with id: ${req.params.id} was not found` });
    //     }
    //     res.json(book);
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    // app.get('/api/books', async (req, res) => {
    //   try {
    //     const books = await Book.find().sort({ _id: 1 });
    //     res.json({ books });
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });
    // app.get('/api/books/search', async (req, res) => {
    //   try {
    //     const { title, author, genre, sort, order } = req.query;
    //     const searchQuery = {};

    //     if (title) searchQuery.title = title;
    //     if (author) searchQuery.author = author;
    //     if (genre) searchQuery.genre = genre;

    //     const books = await Book.find(searchQuery).sort({ [sort || '_id']: order === 'DESC' ? -1 : 1 });

    //     res.json({ books });
    //   } catch (error) {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });

    app.get('/api/routes', async (req, res) => {
      try {
        const { from: station_from, to: station_to, optimize } = req.query;

        // Check if stations exist
        const startStation = await Station.findOne({ station_id: station_from });
        const endStation = await Station.findOne({ station_id: station_to });

        if (!startStation || !endStation) {
          return res.status(404).json({ message: 'One or more stations not found' });
        }

        // Find trains connecting the starting and destination stations
        const trains = await Train.find({
          'stops.station_id': { $in: [station_from, station_to] }
        });

        if (trains.length === 0) {
          return res.status(403).json({
            message: `No routes available from station: ${station_from} to station: ${station_to}`
          });
        }

        // Implement logic for cost or time optimization
        let total_cost = 0;
        let total_time = 0;
        let stations = [];

        // Logic for optimization goes here...
        // Logic for optimization goes here...
        // Initialize variables to store the optimal route details
        let optimalRoute = [];
        let minCost = Infinity;
        let minTime = Infinity;

        // Iterate through the available trains
        for (const train of trains) {
          let currentStation = station_from;
          let currentCost = 0;
          let currentTime = 0;

          // Find the index of the starting station in the train's stops
          const startIndex = train.stops.findIndex(stop => stop.station_id === currentStation);

          // Iterate through the stops from the starting station to the destination station
          for (let i = startIndex; i < train.stops.length; i++) {
            const stop = train.stops[i];

            // Add the time and cost for the current leg of the journey
            if (stop.station_id === station_to) {
              // Reached the destination station
              currentTime += calculateTravelTime(train.stops[i - 1], stop);
              currentCost += calculateFare(train.stops[i - 1], stop);
              break;
            } else {
              // Update current time and cost for the leg of the journey
              currentTime += calculateTravelTime(train.stops[i], train.stops[i + 1]);
              currentCost += calculateFare(train.stops[i], train.stops[i + 1]);
            }
          }

          // Check if the current route is the optimal route based on the optimization parameter
          if (optimize === 'cost' && currentCost < minCost) {
            optimalRoute = getRouteDetails(train, station_from, station_to);
            minCost = currentCost;
          } else if (optimize === 'time' && currentTime < minTime) {
            optimalRoute = getRouteDetails(train, station_from, station_to);
            minTime = currentTime;
          }
        }
        function calculateTravelTime(stop1, stop2) {
          // Assuming stop1.departure_time and stop2.arrival_time are in Date format
          const departureTime = stop1.departure_time.getTime(); // Get departure time in milliseconds
          const arrivalTime = stop2.arrival_time.getTime(); // Get arrival time in milliseconds
          const travelTimeInMillis = arrivalTime - departureTime; // Calculate travel time in milliseconds
          // Convert travel time from milliseconds to minutes
          const travelTimeInMinutes = Math.ceil(travelTimeInMillis / (1000 * 60));
          return travelTimeInMinutes;
        }
        function calculateFare(stop1, stop2) {
          // Considering a simple fare calculation based on distance or fixed rate
          // For simplicity, let's assume a constant fare between stops
          const fare = 10; // Assuming a constant fare of 10 Taka between stops
          return fare;
        }
        function getRouteDetails(train, station_from, station_to) {
          const routeDetails = [];
          let currentStation = station_from;

          // Find the index of the starting station in the train's stops
          const startIndex = train.stops.findIndex(stop => stop.station_id === currentStation);

          // Iterate through the stops from the starting station to the destination station
          for (let i = startIndex; i < train.stops.length; i++) {
            const stop = train.stops[i];
            routeDetails.push({
              station_id: stop.station_id,
              train_id: train.train_id,
              arrival_time: i === startIndex ? null : train.stops[i - 1].arrival_time,
              departure_time: stop.departure_time
            });

            // Break the loop if we reach the destination station
            if (stop.station_id === station_to) {
              break;
            }
          }

          return routeDetails;
        }


        // Respond with the optimal route
        return res.status(200).json({ total_cost, total_time, stations });
      } catch (error) {
        console.error('Error in planning route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });



  })
  .catch((error) => {
    console.log("Connection failed!", error);
    process.exit();
  });

async function flushDatabase() {
  try {
    //await User.deleteMany({});
    await Station.deleteMany({});
    //await Train.deleteMany({});
    console.log("Database flushed!");
  } catch (error) {
    console.error("Failed to flush database:", error);
    process.exit(1);
  }
}

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
