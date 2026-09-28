import struct
import zlib
import math

def create_png(width, height, get_pixel_rgba, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_rgba(x, y, width, height)
            raw_data.extend((r, g, b, a))

    def make_chunk(chunk_type, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b"IHDR", ihdr_data)
    idat = make_chunk(b"IDAT", zlib.compress(bytes(raw_data), 9))
    iend = make_chunk(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(png_header + ihdr + idat + iend)
    print(f"Generated {filename} ({width}x{height})")

def fitness_icon_pixel(x, y, w, h):
    # Normalized coords from -1 to 1
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    dist = math.sqrt(nx*nx + ny*ny)

    # Base background: Dark navy-slate gradient (#0f172a to #1e293b)
    t = (nx + ny + 2) / 4.0
    t = max(0.0, min(1.0, t))
    bg_r = int(15 * (1 - t) + 30 * t)
    bg_g = int(23 * (1 - t) + 41 * t)
    bg_b = int(42 * (1 - t) + 59 * t)

    # Rounded rectangle mask for app icon
    corner_radius = 0.75
    dx = max(0, abs(nx) - (1.0 - 0.28))
    dy = max(0, abs(ny) - (1.0 - 0.28))
    c_dist = math.sqrt(dx*dx + dy*dy)
    if c_dist > 0.28:
        return (0, 0, 0, 0)

    # Dumbbell: rotated 45 degrees
    # rotate (nx, ny) by 45 deg
    angle = -math.pi / 4
    rx = nx * math.cos(angle) - (ny + 0.1) * math.sin(angle)
    ry = nx * math.sin(angle) + (ny + 0.1) * math.cos(angle)

    # Central Bar: -0.45 < rx < 0.45 and abs(ry) < 0.05
    is_bar = abs(rx) < 0.45 and abs(ry) < 0.05
    # Center grip: abs(rx) < 0.15 and abs(ry) < 0.075
    is_grip = abs(rx) < 0.15 and abs(ry) < 0.075
    # Inner plates: 0.35 < abs(rx) < 0.43 and abs(ry) < 0.28
    is_inner_plate = 0.35 < abs(rx) < 0.44 and abs(ry) < 0.28
    # Outer plates: 0.47 < abs(rx) < 0.54 and abs(ry) < 0.20
    is_outer_plate = 0.47 < abs(rx) < 0.54 and abs(ry) < 0.20

    # Pulse / Heartbeat Line in lower quadrant
    # y base around 0.55
    py = ny - 0.55
    # Heartbeat polyline shape
    pulse_y = 0.0
    if -0.6 <= nx < -0.3:
        pulse_y = 0.0
    elif -0.3 <= nx < -0.15:
        # peak up
        pct = (nx - (-0.3)) / 0.15
        pulse_y = -0.22 * pct
    elif -0.15 <= nx < 0.0:
        # plunge down
        pct = (nx - (-0.15)) / 0.15
        pulse_y = -0.22 + 0.48 * pct
    elif 0.0 <= nx < 0.18:
        # high peak
        pct = nx / 0.18
        pulse_y = 0.26 - 0.54 * pct
    elif 0.18 <= nx < 0.32:
        # rebound
        pct = (nx - 0.18) / 0.14
        pulse_y = -0.28 + 0.28 * pct
    elif 0.32 <= nx <= 0.6:
        pulse_y = 0.0
    else:
        pulse_y = 999.0

    is_pulse = abs(nx) <= 0.65 and abs(py - pulse_y) < 0.035

    if is_inner_plate or is_outer_plate:
        # Emerald gradient #10b981
        return (16, 185, 129, 255)
    elif is_grip:
        # Cyan #06b6d4
        return (6, 182, 212, 255)
    elif is_bar:
        # Bright slate
        return (226, 232, 240, 255)
    elif is_pulse:
        # Vibrant orange/coral #f97316
        return (249, 115, 22, 255)
    else:
        # Accent ring
        if 0.68 < dist < 0.72:
            return (int(bg_r + 25), int(bg_g + 50), int(bg_b + 70), 255)
        return (bg_r, bg_g, bg_b, 255)

if __name__ == "__main__":
    create_png(192, 192, fitness_icon_pixel, "icons/icon-192.png")
    create_png(512, 512, fitness_icon_pixel, "icons/icon-512.png")
