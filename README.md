# Add data

Modify the `data/data.json` file to include your own data. The data should be an array of objects, where each object represents a single item. Each object should contain at least the following properties:

* `date` (this is the current value for filtering through the endpoint)

# Run locally

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

# Run on a remote machine

Run the `setup.sh` script to host the server on a remote machine. The script will install the necessary dependencies and start the server.

```bash
./setup.sh
```

Prior to this, it is necessary to correctly set up the `nginx` configuration file. The configuration file should be located at `/etc/nginx/sites-available/default` and should look like this:

```nginx
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/api/;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }

        location /api/ {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

Here, it is important to note the `root /var/www/ind320/public;` line. This should be the path to the `public/` directory of the project. As there is insufficient permissions, it is unable to point directly to the `/root/ind320/api/public/` directory. Instead, the `public/` directory is copied to `/var/www/ind320/` and the `root` path is set to `/var/www/ind320/public/`.
