import json
import pandas as pd

with open("berlin-ubahn-map-master\json\subway2.json",'r') as f:
    data = json.load(f)

lines = data["lines"]
s = set()

for line in lines:
    nodes = line["nodes"]
    for node in nodes:
        s.add("S" + node["name"][1:])

print(len(s))

station = pd.read_csv("station.csv").values
station = station.reshape(-1)
print(station)

for item in s:
    if item in station:
        continue
    print(item)