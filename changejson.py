import json

with open("subway-jmh.json","r") as f:
    jmh_subway = json.load(f)

data = jmh_subway["data"]
edges = jmh_subway["edges"]

stations = {}

station_idx = 0

for item in data:
    station_idx += 1
    stations[item["name"]] = {
        "id":station_idx,
        "name":item["name"],
        "label":item["name"]
    }

colors = ["#008200","#00CFCD","#FF0000","#008280","#FEFF00","#FF6600","#080080","#993367"]
line_id = [1,2,3,4,5,10,11,12]
lines = [{},{},{},{},{},{},{},{}]

last_station = -1
line_index = -1

width = 1100
height = 740

def get_node(item):
    tmp = {}
    tmp["name"] = item["name"]
    tmp["coords"] = [item["x"] * width,height - height * item["y"]]
    tmp["labelPos"] = "N"
    tmp["labelBold"] = True
    return tmp

for item in edges:
    if item["source"] != last_station:
        line_index += 1
        print(line_id[line_index])
        print(item["source"],item["target"])
        # lines[line_index] = {}
        lines[line_index]["name"] = "U" + str(line_id[line_index])
        lines[line_index]["label"] = "U" + str(line_id[line_index])
        lines[line_index]["color"] = colors[line_index]
        lines[line_index]["shiftCoords"] = [0,0]
        lines[line_index]["nodes"] = []
        lines[line_index]["nodes"].append(get_node(data[item["source"]]))
    lines[line_index]["nodes"].append(get_node(data[item["target"]]))
    last_station = item["target"]

output = {"stations":stations,"lines":lines}
# print(output)
with open("berlin-ubahn-map-master\json\subway2.json","w") as f:
    json.dump(output, f)