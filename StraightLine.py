import json

with open("berlin-ubahn-map-master\json\subway.json",'r') as f:
    data = json.load(f)

# 1 竖直修改   2 水平修改    3 斜线修改(x不变) 4斜线修改(y不变)
change_type = 4
lines = data["lines"]
modify_nodes = [67,154,30]

st,ed = modify_nodes[0],modify_nodes[-1]
st_node,ed_node = [],[]

for line in lines:
    nodes = line["nodes"]
    for node in nodes:
        if node["name"] == "sta" + str(st):
            st_node = node["coords"]
        if node["name"] == "sta" + str(ed):
            ed_node = node["coords"]

print(st_node)
print(ed_node)

for line in lines:
    nodes = line["nodes"]
    for node in nodes:
        if int(node["name"][3:]) in modify_nodes:
            if change_type == 1:
                # 修改x与modify_nodes第一个点一样
                node["coords"][0] = st_node[0]
            elif change_type == 2:
                # 修改y与modify_nodes第一个点一样
                node["coords"][1] = st_node[1]
            else:
                # 直线拟合
                x1,y1 = st_node[0],st_node[1]
                x2,y2 = ed_node[0],ed_node[1]
                if  change_type == 3:
                    x = node["coords"][0]
                    y = (x - x1) * (y2 - y1) / (x2 - x1) + y1
                    node["coords"][1] = y
                else:
                    y = node["coords"][1]
                    x = (y - y1) * (x2 - x1) / (y2 - y1) + x1
                    node["coords"][0] = x

with open("berlin-ubahn-map-master\json\subway.json","w") as f:
    json.dump(data, f)