import users from "../utils/usersLoginData";
import calculateInversionCount from "../utils/inversionCountLogic";
const currentUser=users[0];

const Card=(props)=>{
    return(
        <div className="flex justify-center border p-4 m-2 ">
            <div className="me-30 border border-black p-3 flex items-center">
              Image coming Soon...
            </div>
            <dl className="grid grid-flow-col grid-rows-4 gap-4">
              <dt className="">UserName: </dt>
              <dd className="col-start-2">{props.name}</dd>
              <dt>Age: </dt>
              <dd className="col-start-2">{props.age}</dd>
              <dt>Location </dt>
              <dd className="col-start-2">{props.location}</dd>
              <dt>Bio: </dt>
              <dd className="col-start-2">{props.bio}</dd>
              <dt>Inversion Count: </dt>
              <dd className="col-start-2">{calculateInversionCount(props.user, currentUser)}</dd>
            </dl>
        </div>
    )
}

const Matchings=()=>{
    const UserMatchings=users.filter(user=>user.id!=currentUser.id).map((user, index)=>
        <Card key={index+1} user={user} name={user.name} age={user.age} location={user.location.city} bio={user.bio}></Card>
    );
    return (
        <div>
            {UserMatchings}
        </div>
    )
}

export default Matchings;