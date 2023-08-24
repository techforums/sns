const Document = require("../../models/doc");

//get all posted documents
exports.getDocument = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const pipeline = [
      {
        $match: {
          isApproved: true,
        },
      },
      {
        $sort: {
          createdDate: -1,
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          fileName: 1,
          docData: 1,
          isApproved: 1,
          createdDate: 1,
          "user.firstName": 1,
          "user.lastName": 1,
        },
      },
    ];

    const docs = await Document.aggregate(pipeline);
    res.json(docs);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
};

//get a specific document
exports.getDocuments = async (req, res) => {
  const id = req.params.id;
  if (id.length !== 24) {
    return res.status(400).json({
      status: 400,
      message: "Invalid document id",
    });
  }
  try {
    const doc = await Document.findById(id).populate([
      {
        path: "userId",
      }
    ]);;
    if (!doc) {
      return res.status(404).json({
        status: 404,
        message: "Document not found!",
        detail: "We cannot find the page you are looking for.",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "Succesfully got the Document",
        data: doc,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
};

// //get document by userId

exports.getDocumentuser = async (req,res) => {
  try {
    const userId = req.params.userId;
    const doc = await Document.find({ userId }).populate([
      { 
        path:"userId",
      },
    ]);
    console.log(doc)
    if(!doc){
      return res.status(404).json({
        status:404,
        message:"Data not Found"
    });
   } else{
      res.status(200).json({
        status: 200,
        message :" Document get successfully",
        data:doc,
      });
     }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({
      status:500,
      message: "Server Error",
    });
  }
}


//post a new document

exports.postDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 400,
      error: "No file uploaded",
    });
  }
  try {
    console.log(req.file);
    const userId = req.userId
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const docData = req.file.buffer;
    const document = new Document({
      fileName,
      fileType,
      docData,
      userId
    
    });
    await document.save()
    return res.status(201).json({
      status: 201,
      message: "Succesfully posted a Document",
      data: document,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
};

//delete an existing document
exports.deleteDocument = async (req, res) => {
  const id = req.params.id;
  if (id.length !== 24) {
    return res.status(400).json({
      status: 400,
      message: "Invalid document id",
    });
  }
  try {
    const deleteD = await Document.findByIdAndDelete(id);
    if (!deleteD) {
      res.status(404).json({
        status: 404,
        message: "Already deleted!",
        detail: "Document has already been deleted.",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "Succesfully deleted Document",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server Error",
    });
  }
};
