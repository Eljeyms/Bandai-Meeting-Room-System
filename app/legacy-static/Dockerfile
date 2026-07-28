# Bandai Namco Meeting Room System — static UI served by nginx
FROM nginx:1.27-alpine

# Copy the UI into nginx's web root
COPY src/ /usr/share/nginx/html/

# Custom nginx config (caching + clean routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
