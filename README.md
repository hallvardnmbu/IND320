# Set up your own API server

The following repository is a simple API server that serves data from a JSON file (although this might easily be exchanged with a database of choice). In addition, the server hosts a static website displaying the documentation for the API.

Exchange `{{ DOMAIN }}` with your domain name, e.g., `ind320.no`.

This guide is specific for Ubuntu/Debian-based systems. For other systems, the commends might differ.

## Add your data

Modify the `data/data.json` file to include your own data. The data should be an array of objects, where each object represents a single item. Each object should contain at least the following properties;

* `id` (used by the `id` endpoint)
* `date` (used by the `dates` endpoint)

for the current implementation to work. Feel free to modify `app.js` to include additional properties.

## Host the server

Run the `setup.sh` script to host the server on a (remote) machine. The script will install the necessary dependencies and start the server.

```bash
chmod +x setup.sh
./setup.sh
```

## Set up SSL (optional)

Install certbot to acquire an SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d {{ DOMAIN }} -d api.{{ DOMAIN }}
```

## Set up nginx configuration

Note: if SSL step is skipped, the redirect to https should be removed, along with the relevant SSL-lines.

The main configuration file should be located at `/etc/nginx/sites-available/default`. Modify the file to include the following configuration:

```nginx
# Main domain configuration
server {
    listen 80;
    listen [::]:80;
    server_name {{ DOMAIN }};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name {{ DOMAIN }};

    root /var/www/api/;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/{{ DOMAIN }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ DOMAIN }}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ =404;
    }
}

# API subdomain configuration
server {
    listen 80;
    listen [::]:80;
    server_name api.{{ DOMAIN }};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.{{ DOMAIN }};

    ssl_certificate /etc/letsencrypt/live/api.{{ DOMAIN }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.{{ DOMAIN }}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
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

### Guide to set up automatic file copying from `/root/api/` to `/var/www/api/` on changes.

<details>
  <summary>1. Monitoring script</summary>
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
</details>

<details>
  <summary>2. Systemd service</summary>
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
</details>

## Domain configuration

Once all the above is done, it is necessary to point the domain to the server. This is done by setting the A record of the domain to the IP address of the server:

```raw
A {{ DOMAIN }} {{ IP }}
A api.{{ DOMAIN }} {{ IP }}
```

Example:

```raw
A ind320.no 123.45.654.321
A api.ind320.no 123.45.654.321
```
