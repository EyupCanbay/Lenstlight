import Photo from "../models/photoModels.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

const createPhoto = async (req,res)=>{
    
    const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
            use_filename: true,
            folder: 'lenslight',
        }
    );

    try{
        await Photo.create({
            name: req.body.name,
            description: req.body.description,
            user: res.locals.user._id,
            linkPhoto: result.secure_url,
            publicId : result.public_id,
        });
        fs.unlinkSync(req.files.image.tempFilePath);
        
        res.status(201).redirect('/users/dashboard');
    } catch {
        res.status(500).josn({
            succeeded: false,
            error,
        });
    }
};

const getAllPhotos = async (req,res)=>{
    try{
        let photos;

        if (res.locals.user) {
            photos = await Photo.find({ user: { $ne: res.locals.user._id } });
        } else {  
            photos = await Photo.find({});
        }
        
        res.status(200).render('photos', {
            photos,
            link: 'photos',
        });
        


    } catch{
        res.status(500).json({
            succeeded: false,
            error: "You did not login",
            details: error.message,
        });
    }
}

const getAPhoto = async (req,res)=>{
    try{
        const photo = await Photo.findById({_id : req.params.id}).populate("user");
        res.status(200).render('photo',{
            photo,
            link:'photo',
        });
    } catch{
        res.status(500).json({
            succeeded: false,
            error,
        });
    }
}

const deleteAPhoto = async ( req,res)=> {
    try{
        const photo = await Photo.findById(req.params.id);

        await cloudinary.uploader.destroy(photo.publicId)
        await Photo.findByIdAndDelete({_id : photo._id})

        return res.status(200).redirect("/users/dashboard");
        
    
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            error,
            details: error.message
        })
    }
}

const updatePhoto = async(req,res)=> {
    try{
    const photo = await Photo.findByIdAndUpdate(req.params.id)

    if(!photo){
        res.status(404).json({
            succeeded: false,
            error: "Photo is not found",
            details: error.message,
        })
    }

    if(req.files && req.files.image){
        await cloudinary.uploader.destroy(photo.publicId);
        
        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
                use_filename: true,
                folder: 'lenslight',
            }
        );
        if(!result){
            res.status(500).json({
                succeeded: false,
                error: "Cloudinary could not connect",
                details: error.message,
            })
        }

        photo.linkPhoto = result.secure_url;
        photo.publicId = result.public_id;

        fs.unlinkSync(req.files.image.tempFilePath);
    }

    photo.name=req.body.name;
    photo.description = req.body.description;

    await photo.save();

    res.status(201).redirect(`/photos/${req.params.id}`);
    } catch (error) {
    res.status(500).json({
        succeeded : false,
        error: "Do not update it",
        details: error.message,
    })
    }
}


export { createPhoto, getAllPhotos, getAPhoto, deleteAPhoto, updatePhoto};

