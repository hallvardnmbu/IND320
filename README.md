# Add data

Modify the `api/data.json` file to include your own data. The data should be an array of objects, where each object represents a single item. Each object should have the following properties:

* `date` (this is the current value for filtering through the endpoint)

# Start the server

Navigate to `api/`:

```bash
cd api/
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

# Host the server

Run the `setup.sh` script to host the server on a remote machine. The script will install the necessary dependencies and start the server.

```bash
./setup.sh
```
