//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const { name } = require("ejs");
const _=require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema= {
  name:String
};

const Item= mongoose.model("item",itemSchema);

const item1=new Item({name:"Welcome to your todolist!"});
const item2=new Item({name:"Hit the + button to add a new item."});
const item3=new Item({name:"<-- Hit this to delete an item."});

const defaultItems=[item1,item2,item3];



async function insertDefaultItems() {
  try{
    await Item.insertMany(defaultItems).then()
    console.log("Succesfully added");
  }catch{
    console.log(err);
  }
}

const listSchema={
    name:String,
    items:[itemSchema]
}
const lists=mongoose.model("list",listSchema);

app.get("/", function(req, res) {  



    Item.find()
      .then((foundItems)=>{
        if (foundItems.length===0){
          insertDefaultItems()
          res.redirect('/')
        }else{
          res.render("list", {listTitle: "Today", newListItems: foundItems})
        }
          
      })
      .catch(err=>{
        console.log(err);
      });

});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const newItem=new Item({name:itemName});
  const listName=req.body.list;

  if(listName==="Today"){
    newItem.save();
    res.redirect('/');
  }else{
    lists.findOne({name:listName})
    .then((item)=>{
      item.items.push(newItem)
      item.save();
    })
    res.redirect("/"+listName);
  }
  
  
});

app.post("/delete",function(req,res){

  checkedItemId=req.body.checkbox
  const listName=req.body.listName;

  if (listName==="Today"){
      Item.deleteOne({_id:checkedItemId})
  .then(()=>{
    console.log("Deleted")
  })
  .catch(err=>{
    console.log(err)
  });
  res.redirect('/')

  }else{
    lists.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(()=>{
      console.log("Deleted+")
    })
    .catch(err=>{
      console.log(err)
    })
  }
  res.redirect('/'+listName)
})


app.get("/:route",function(req,res){

  const customListName=_.capitalize(req.params.route);


  lists.findOne({name:customListName})
  .then((listItem)=>{
    if(!listItem){
        const list=new lists({
    name:customListName,
    items:defaultItems
  })
  list.save()
  res.redirect("/"+customListName)
  }else{
    res.render("list", {listTitle: customListName, newListItems: listItem.items})
  }
  })
  .catch(err=>{
    console.log(err)
  })
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
