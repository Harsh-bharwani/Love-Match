import users from "../utils/usersLoginData";

const currentUser=users[0];

const UserProfileCard=()=>{
  return (
    <div className="flex justify-center bg-sky-500/100 text-white p-4 mt-2">
        <div className="me-30 border border-black p-3 flex items-center">
          Image coming Soon...
        </div>
        <dl className="grid grid-flow-col grid-rows-4 gap-4">
          <dt className="">UserName: </dt>
          <dd className="col-start-2">{currentUser.name}</dd>
          <dt>Age: </dt>
          <dd className="col-start-2">{currentUser.age}</dd>
          <dt>Location </dt>
          <dd className="col-start-2">{currentUser.location.city}</dd>
          <dt>Bio: </dt>
          <dd className="col-start-2">{currentUser.bio}</dd>
        </dl>
    </div>
  )
}

export default UserProfileCard;