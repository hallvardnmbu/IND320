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
chmod +x setup.sh
./setup.sh
```

Prior to this, it is necessary to correctly set up the `nginx` configuration file. The configuration file should be located at `/etc/nginx/sites-available/default` and should look like this:

```nginx
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/api/;

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

After setting up the configuration file, restart the `nginx` service:

```bash
sudo systemctl restart nginx
```

Here, it is important to note the `root /var/www/api/;` line. This should be the path to the the root directory of the project. As there is insufficient permissions, it is unable to point directly to the `/root/api/` directory. Instead, the directory is copied to `/var/www/api/` and the `root` path is set to `/var/www/api/`.

## Guide to set up automatic file copying from `/root/api/` to `/var/www/api/` on changes.

### 1.

Create the monitoring script:

`sudo apt-get install inotify-tools`

`sudo vim /usr/local/bin/monitor-api.sh`

```sh
#!/bin/bash

inotifywait -m -r -e modify,create,delete /root/api/ |
while read path action file; do
    echo "The file '$file' appeared in directory '$path' via '$action'"
    cp -r /root/api/ /var/www/
done
```

`sudo chmod +x /usr/local/bin/monitor-api.sh`

### 2.

Create the systemd service:

`sudo vim /etc/systemd/system/monitor-api.service`

```sh
[Unit]
Description=Monitor /root/api/ and copy to /var/www/ on changes
After=network.target

[Service]
ExecStart=/usr/local/bin/monitor-api.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable monitor-api.service
sudo systemctl start monitor-api.service
```
