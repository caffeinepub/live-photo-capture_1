import Int "mo:core/Int";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type Photo = {
    id : Text;
    blob : Storage.ExternalBlob;
    capturedAt : Int;
  };

  let photos = Map.empty<Text, Photo>();

  public shared ({ caller }) func savePhoto(id : Text, blob : Storage.ExternalBlob, capturedAt : Int) : async Photo {
    if (photos.containsKey(id)) { Runtime.trap("Photo with this ID already exists.") };
    let photo : Photo = {
      id;
      blob;
      capturedAt;
    };
    photos.add(id, photo);
    photo;
  };

  public query ({ caller }) func getAllPhotos() : async [Photo] {
    photos.values().toArray();
  };

  public shared ({ caller }) func deletePhoto(id : Text) : async () {
    if (not photos.containsKey(id)) { Runtime.trap("Photo does not exist.") };
    photos.remove(id);
  };
};
