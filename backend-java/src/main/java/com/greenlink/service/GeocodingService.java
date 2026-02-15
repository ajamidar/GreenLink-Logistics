package com.greenlink.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;

@Service
public class GeocodingService {

    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}";
    private static final String NOMINATIM_SEARCH_URL =
            "https://nominatim.openstreetmap.org/search?format=json&limit=1&q={address}";
    private static final String USER_AGENT = "GreenLink/1.0 (contact: dev@greenlink.local)";
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);

    private final RestTemplate restTemplate;

    public GeocodingService() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        this.restTemplate = new RestTemplate(requestFactory);
    }

    public String getAddress(double lat, double lon) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, USER_AGENT);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    NOMINATIM_URL,
                    HttpMethod.GET,
                    entity,
                    Map.class,
                    lat,
                    lon
            );

            Map body = response.getBody();
            if (body != null) {
                Object displayName = body.get("display_name");
                if (displayName instanceof String display && !display.isBlank()) {
                    return display;
                }
            }
        } catch (RestClientException ex) {
            // Fall back to coordinate string to avoid request failures breaking order creation.
        }

        return formatCoordinates(lat, lon);
    }

    public GeocodeResult geocodeAddress(String address) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, USER_AGENT);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<java.util.List> response = restTemplate.exchange(
                    NOMINATIM_SEARCH_URL,
                    HttpMethod.GET,
                    entity,
                    java.util.List.class,
                    address
            );

            java.util.List results = response.getBody();
            if (results != null && !results.isEmpty()) {
                Object first = results.get(0);
                if (first instanceof Map result) {
                    Object latObj = result.get("lat");
                    Object lonObj = result.get("lon");
                    Object display = result.get("display_name");

                    Double lat = parseCoordinate(latObj);
                    Double lon = parseCoordinate(lonObj);

                    if (lat != null && lon != null) {
                        String formattedAddress = display instanceof String value ? value : address;
                        return new GeocodeResult(lat, lon, formattedAddress);
                    }
                }
            }
        } catch (RestClientException ex) {
            // Fall back to null so the caller can handle failures gracefully.
        }

        return null;
    }

    private String formatCoordinates(double lat, double lon) {
        return String.format(Locale.US, "%.5f, %.5f", lat, lon);
    }

    private Double parseCoordinate(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String text) {
            try {
                return Double.parseDouble(text);
            } catch (NumberFormatException ex) {
                return null;
            }
        }
        return null;
    }

    public record GeocodeResult(double latitude, double longitude, String address) {}
}
